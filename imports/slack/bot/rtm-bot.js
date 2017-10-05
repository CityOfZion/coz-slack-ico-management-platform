import {Meteor} from 'meteor/meteor';
import {isAdmin, parseUserName} from "/imports/slack/helpers";
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
import { HTTP } from 'meteor/http';

const messageType = message => {
  let type = '';
  
  if(message.subtype) {
    type = message.subtype;
  } else if(message.command) {
    type = 'command';
  } else {
    type = message.type;
  }
  
  return type;
};

const removeUrl = string => {
  let newString = string;
  let loop = true;
  while(loop) {
    let start  = newString.indexOf('http') - 1; // should be <
    if(start >= 0) {
      const end = newString.indexOf('>') + 1;
      if(end >= 0) {
        newString = newString.replace(newString.slice(start, end), '**link removed**');
      } else {
        loop = false;
      }
    } else {
      loop = false;
    }
  }
  return newString
};

export default class Bot {
  constructor(team) {
    this.team = team;
    this.rtm = new RtmClient(team.oauth.bot.bot_access_token);
    this.web = new WebClient(team.oauth.access_token);
  }
  
  log(data) {
    data.dateInserted = new Date();
    data.teamId = this.team.id;
    Logs.insert(data);
  }
  
  banUser = (user, byUser) => {
    console.log('TRYING TO BAN USER', user.name);
    const isBanned = Banned.find({user: user.id, team_id: this.team.id}).count() > 0;

    if(!this.team.settings.askBeforeBan && !isBanned && user && !isAdmin(user)) {
      console.log('BANNING USER');
      Banned.insert({user: user, name: user.name, team_id: this.team.id, byUser: byUser, banDate: new Date()});
      this.notifyChannel(`\`${byUser}\` banned a user with id \`${user.id}\` and name \`${user.name}\` <@${user.id}|${user.name}> `);
      this.deactivateUser(user.id, user.name, byUser);
    } else {
      console.log('USER ALREADY BANNED, WILL STILL DEACTIVATE');
      this.deactivateUser(user.id, user.name, byUser);
    }
  };

  deactivateUser = (user, username, byUser) => {
    if(!this.team.settings.adminToken) return;
    const apiUrl = `${this.team.url}api/users.admin.setInactive?token=${this.team.settings.adminToken}&user=${user}`;
    console.log('calling url', apiUrl);
    HTTP.get(apiUrl, (err, res) => {
      console.log('tried to deactivate a user by api token', err, res);
      if(res.data.ok) {
        this.notifyChannel(`\`${byUser}\` deactivated a user with id \`${user}\` and name \`${username}\` <@${user}|${username}> `);
      }
    })
  };
  
  enableUser = (user, username) => {
    Banned.remove({"user.id": user, team_id: this.team.id});
    if(!this.team.settings.adminToken) return;
    const apiUrl = `${this.team.url}api/users.admin.setRegular?token=${this.team.settings.adminToken}&user=${user}`;
    console.log('calling url', apiUrl);
    HTTP.get(apiUrl, (err, res) => {
      console.log('tried to reactivate a user by api token', err, res);
      if(res.data.ok) {
        this.notifyChannel(`Reactivated a user with id \`${user}\` and name \`${username}\` <@${user}|${username}> `);
      }
    })
  };
  
  notifyChannel = message => {
    if(this.team.settings.warningMessageChannel !== '') {
      this.web.chat.postMessage(this.team.settings.warningMessageChannel, message);
    }
  };
  
  setPrice = () => {
    console.log('Fetching price');
    HTTP.call('GET', `https://api.coinmarketcap.com/v1/ticker/${this.team.settings.priceAnnouncementsCoin}/?convert=USD`, (err, res) => {
      if(!err && !res.data.error) {
        const price = res.data[0];
        const message = `${price.symbol} $${price.price_usd} | B${price.price_btc} | 1HCHANGE ${price.percent_change_1h}%`;
        if(this.team.settings.priceAnnouncementInTopic) {
          this.web.channels.setTopic(this.team.settings.priceAnnouncementsChannel, message, (err, res) => {
          });
        } else {
          this.web.chat.postMessage(this.team.settings.priceAnnouncementsChannel, message, (err, res) => {
          });
        }
      }
    });
  };
  
  sendPrivateMessage = (userId, message) => {
    this.web.im.open(this.team.oauth.bot.bot_user_id, (err, res) => {
      console.log(err, res);
      if(res.ok) {
        console.log('SENDING MESSAGE TO TARGET USER '+ userId);
        console.log(res);
        const channelId = res.channel.id;
        this.rtm.sendMessage(channelId, message, {as_user: false, username: 'BAN BOT'});
      }
    });
  };
  
  getTeam() {
    this.team = Teams.findOne({id: this.team.id});
  }
  
  start() {
    this.rtm.start();
    this.messageEvent();
    this.authenticateEvent();
    this.disconnectEvent();
    this.startPriceBot();
  }
  
  restart() {
    this.rtm.disconnect();
    this.getTeam();
    this.rtm.start();
    this.startPriceBot();
  }
  
  async handleMessageEvent(message) {
    const msgType = messageType(message);
    if (['pong', 'reconnect_url', 'presence_change', 'hello', 'user_typing', 'message_deleted', 'bot_message', 'im_open', 'im_close'].includes(msgType)) {
      return;
    }
    console.log('type', msgType);
    
    if(!message.user && message.user_id) message.user = message.user_id;
    
    let user = Meteor.users.findOne({"profile.user_id": message.user, "profile.team_id": this.team.id});
  
    // Check if users have forced signup
    if(this.team.settings.forceUserSignup) {
      // User is not yet signed up
      console.log('USER IS FORCED TO SIGN UP!');
      if(!user) {
        console.log('USER NOT FOUND DELETING MESSAGE');
        this.web.chat.delete(message.ts, message.channel);
        return;
      }
    }
    
    // get user info from slack instead
    if(!user && typeof message.user === 'string') {
      console.log(message.user);
      const userResult = await this.web.users.info(message.user);
      console.log('GETTING SLACK USER INSTEAD!!');
      if(userResult.ok) {
        user = userResult.user;
      }
    } else if(typeof message.user === 'object') {
      user = message.user;
    }
  
  
    let targetUser = {};
    if(typeof message.target_user === 'string') {
      const userResult = await this.web.users.info(message.target_user);
      if(userResult.ok) {
        targetUser = userResult.user;
      }
    }
    
    const isBanned = Banned.find({"user.id": user.id, team_id: this.team.id}).count() > 0;
  
    // Remove banned user's messages
    if(isBanned && this.team.settings.removeBannedUserMessages) {
      console.log('USER IS BANNED REMOVING MESSAGE!');
      this.web.chat.delete(message.ts, message.channel, (err, res) => {
        if(err || !res.ok) this.web.chat.postMessage(message.channel, 'This user has been banned, be aware of their messages!', message.user);
      });
      return;
    }
  
    const byUser = user.name ? user.name : user.profile.identity.user.name;
    switch(msgType) {
      case 'reminder_add':
        message.raw = message.text.substring(
          message.text.indexOf('“') + 1,
          message.text.lastIndexOf('”')
        );
        message.byAdmin = isAdmin(user);
        if (this.team.settings.allowReminders) {
          if(!isAdmin(user)) {
            if(!this.team.settings.allowUserReminders) {
              this.web.chat.delete(message.ts, message.channel);
              Reminders.insert(message);
              this.banUser(user, 'REMINDER CHECKER');
            }
          }
        } else {
          this.web.chat.delete(message.ts, message.channel);
          Reminders.insert(message);
        }
        break;
      case 'message':
        console.log('-------MESSAGE-------');
        // Reminders use USLACKBOT user to post to main channels
        if(message.user === 'USLACKBOT') {
          console.log('USER IS SLACKBOT');
          if(message.text.indexOf('Reminder:') >= 0) {
            console.log('FOUND REMINDER IN TEXT');
            if (this.team.settings.allowReminders) {
              console.log('TEAM IS ALLOWING REMINDERS');
              const reminder = Reminders.findOne({raw: message.text});
              if(!reminder.byAdmin) {
                console.log('NOT MADE BY ADMIN');
                if(!this.team.settings.allowUserReminders) {
                  console.log('USER REMINDERS NOT ALLOWED');
                  if(!this.team.settings.askBeforeBan) Banned.insert({user: message.user, team_id: this.team.id});
                  this.web.chat.delete(message.ts, message.channel);
                }
              }
            } else {
              console.log('REMINDERS NOT ALLOWED');
              this.web.chat.delete(message.ts, message.channel);
            }
          }
          return;
        }
        
        // Remove direct message spam (DM channels start with D)
        if((this.team.settings.removeDmSpam && message.channel.charAt(0) === 'D') || this.team.settings.removePublicChannelSpam) {
          console.log('FOUND MESSAGE AND SPAM REMOVAL IS ON');
          // test if the message contains banned words
          if (this.team.settings.triggerWords.some(function(v) { return message.text.indexOf(v) >= 0; })) {
            // We found a match now let's delete
            console.log('FOUND A MSG MATCHING ONE OF THE WORDS');
            
            this.web.chat.delete(message.ts, message.channel, (err, res) => {
              if(err || !res.ok) {
                if(message.channel.charAt(0) === 'D' && this.team.settings.warnUserAboutScam) {
                  console.log('IT WAS A PRIVATE MESSAGE AND COULD NOT BE DELETED');
                  this.web.chat.postMessage(message.channel, this.team.settings.userScamWarningMessage, message.user);
                } else {
                  this.web.chat.postMessage(message.channel, 'A scam message was detected please be careful!', message.user);
                }
              }
            });
            this.banUser(user, 'SPAM REMOVER');
            
          } else {
            console.log('MESSAGE DID NOT MEET SPAM REQUIREMENTS');
          }
        }
        
        // Remove urls from messages if possible
        if(this.team.settings.removeLinks && !isAdmin(user)) {
          console.log('REMOVING URL');
          const newText = removeUrl(message.text);
          console.log('MESSAGE', message.text, newText);
          if(message.text !== newText) {
            this.web.chat.update(message.ts, message.channel, newText, {as_user: true}, (err, res) => {
              console.log('UPDATING MSG WITHOUT URLS2', res, err);
              if(err || !res.ok) {
                console.log('COULD NOT UPDATE MESSAGE, TRYING TO DELETE');
                this.web.chat.delete(message.ts, message.channel, () => {
                  if(message.channel.charAt(0) === 'D') {
                    this.web.chat.postMessage(message.channel, 'A user sent an URL to you, be careful of scam attacks!', message.user);
                  } else {
                    this.web.chat.postEphemeral(message.channel, 'URLS are not allowed', message.user);
                  }
                })
              }
            });
          }
        }
        break;
      case 'team_join':
      case 'user_change':
        console.log('USER CHANGE');
        // Check if target user is banned
        if(this.team.settings.removeDuplicateUserNames && !isAdmin(user) && !isBanned) {
          console.log('DUPLICATE USERNAME PROTECTING ON');
          // Check if the new user is part of the restricted names
          const restrictedUsername = this.team.settings.restrictedUserNames.indexOf(message.user.name.toLowerCase().replace(' ', '').replace('-', '').replace('_', '')) >= 0;
          const restrictedRealName = this.team.settings.restrictedUserNames.indexOf(message.user.profile.real_name.toLowerCase().replace(' ', '').replace('-', '').replace('_', '')) >= 0;
          const restrictedDisplayName = this.team.settings.restrictedUserNames.indexOf(message.user.profile.display_name.toLowerCase().replace(' ', '').replace('-', '').replace('_', '')) >= 0;
          if(restrictedUsername || restrictedRealName || restrictedDisplayName) {
            console.log('RESTRICTED NAME USED');
            
            const impersonatingUser = restrictedRealName ? message.user.name : message.user.real_name;
            this.notifyChannel(`\`${impersonatingUser}\` is trying to impersonate with one of these names \`${message.user.name}\` | \`${message.user.profile.real_name}\` | \`${message.user.profile.display_name}\``);
  
            this.banUser(message.user, 'USERNAME PROTECTION');
          }
        }
        
        if(this.team.settings.removeSuspiciousEmailDomainUsers && !isAdmin(user) && !isBanned) {
          if(this.team.settings.suspiciousEmailDomains.indexOf(user.profile.email) >= 0) {
            this.notifyChannel(`User with id \`${message.user.id}\` and name \`${message.user.name}\` has been preemptively banned for using a banned email domain`);
    
            this.banUser(message.user, 'EMAIL DOMAIN PROTECTION');
          }
        }
        
        if(this.team.settings.removeOtherSlackBannedUserEmails && !isAdmin(user) && !isBanned) {
          const bannedEmail = Banned.find({"user.profile.email": message.user.email}).count();
          if(bannedEmail > 0) {
            this.notifyChannel(`User with id \`${message.user.id}\` and name \`${message.user.name}\` has been preemptively banned as the email address was used to spam another slack`);
            this.banUser(message.user, 'USER WAS BANNED ON OTHER SLACK');
          }
        }
        break;
      case 'command':
        switch(message.command) {
          case '/report':
            console.log('REPORT COMMAND');
            if(this.team.settings.allowUserReport) {
              console.log('USER REPORTING ALLOWED');
              const report = Reported.findOne({user: message.target_user, team_id: this.team.id});
              console.log('USER HAS BEEN REPORTED BEFORE? ', !!report);
              if(report) {
                console.log('USER WAS REPORTED BEFORE');
                if (this.team.settings.reportsNeededForBan <= report.reports + 1) {
                  console.log('REPORTS OVER THRESHOLD, BANNING USER!');
                  this.notifyChannel(`\`${message.target_username}\` with id \`${message.target_user}\` ${message.user_string} was reported by \`${byUser}\` for \`${message.reason}\` \`${report.reports + 1}/${this.team.settings.reportsNeededForBan}\` votes needed`);
                  Reported.update({user: message.target_user},{$inc: {reports: 1}, $push: {reporters: {user: message.user_id, byUser: byUser, reason: message.reason}}});
                  this.banUser(targetUser, 'COMMUNITY');
                } else {
                  console.log('REPORTED USER');
                  this.notifyChannel(`\`${message.target_username}\` with id \`${message.target_user}\` ${message.user_string} was reported by \`${byUser}\` for \`${message.reason}\` \`${report.reports + 1}/${this.team.settings.reportsNeededForBan}\` votes needed`);
                  Reported.update({user: message.target_user},{$inc: {reports: 1}, $push: {reporters: {user: message.user_id, byUser: byUser, reason: message.reason}}});
                }
              } else {
                console.log('USER REPORTED FOR FIRST TIME');
                if (this.team.settings.reportsNeededForBan <= 1) {
                  console.log('REPORTS OVER THRESHOLD, BANNING USER!');
                  this.banUser(targetUser, 'COMMUNITY');
                }
                Reported.insert({user: message.target_user, username: message.target_username, team_id: this.team.id, reports: 1, reporters: [{user: message.user_id, byUser: byUser, reason: message.reason}]});
                this.notifyChannel(`\`${message.target_username}\` with id \`${message.target_user}\` ${message.user_string} was reported by \`${byUser}\` for \`${message.reason}\`  \`1/${this.team.settings.reportsNeededForBan}\` votes needed`);
              }
            }
            break;
          case '/nukefromorbit':
            console.log('NUKE COMMAND');
            
            if(isAdmin(user)) {
              this.banUser(targetUser, byUser);
            }
            break;
        }
        break;
      default:
        break;
    }
  }
  
  messageEvent() {
    this.rtm.on(CLIENT_EVENTS.RTM.RAW_MESSAGE, Meteor.bindEnvironment(message => {
      const msg = JSON.parse(message);
      this.handleMessageEvent(msg);
  
    }));
  }
  
  disconnectEvent() {
    this.rtm.on(CLIENT_EVENTS.RTM.DISCONNECT, Meteor.bindEnvironment(message => {
      console.log('Disconnected');
      Bots.upsert({teamId: this.team.id}, {$set: {
        running: false
      }});
      this.rtm.reconnect();
    }));
  }
  
  startPriceBot() {
    if(this.getPriceInterval) Meteor.clearInterval(this.getPriceInterval);
  
    if(this.team.settings.enablePriceAnnouncements) {
      console.log(this.team.settings.priceAnnouncementsInterval);
      this.getPriceInterval = Meteor.setInterval(this.setPrice, this.team.settings.priceAnnouncementsInterval * 1000 * 60);
    }
  }
  
  authenticateEvent() {
    this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, Meteor.bindEnvironment(message => {
      console.log('Authenticated');
      Bots.upsert({teamId: this.team.id}, {$set: {
        teamId: this.team.id,
        teamName: this.team.name,
        token: this.team.bot,
        running: true,
        dateStarted: new Date()
      }});
    }));
  }
}