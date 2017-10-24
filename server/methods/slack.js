import {isAdmin} from '/imports/slack/helpers';

const createSharedInviteNoCaptcha = teamId => {
  try {
    const team = Teams.findOne({id: teamId});
    if (team.settings.adminToken.trim() === '' && !team.settings.enableInvitations) return '';
    
    const apiUrl = `${team.url}api/users.admin.createSharedInvite?token=${team.settings.adminToken}&max_signups=1&expiration=0.0035&disable_email=true`;
    const data = HTTP.get(apiUrl).data;
    const {ok, error, url} = data;
    
    if (ok) {
      return {result: url};
    } else {
      return {error};
    }
  } catch(e) {
  
  }
}

Meteor.methods({
  enableUser(userId, name) {
    console.log('trying to enable user');
    if(!isAdmin(Meteor.user())) return false;
    console.log('Caller was an admin');
    const bot = BotStorage[Meteor.user().profile.auth.team_id];
    if(bot) {
      console.log('bot was found calling enable function');
      bot.enableUser(userId, name, Meteor.user().profile.auth.user.name);
      return {success: true}
    }
  },
  importMessages() {
    if(!isAdmin(Meteor.user())) return false;
  
    const bot = BotStorage[Meteor.user().profile.auth.team_id];
  
    if(bot) {
      bot.importMessages();
    }
  },
  importFiles() {
    if(!isAdmin(Meteor.user())) return false;
  
    const bot = BotStorage[Meteor.user().profile.auth.team_id];
  
    if(bot) {
      bot.importFiles();
    }
  },
  createAdminEmailInvite(teamId, email, response) {
    try {
      const team = Teams.findOne({id: teamId});
      if (team.settings.inviteLimitReached) Meteor.call('createSharedInvite', teamId);
      if (team.settings.adminToken.trim() === '' && !team.settings.enableInvitations) return '';
  
      if (team.settings.enableCaptcha) {
        console.log('testing captcha');
        if (response === '') return {error: 'Captcha invalid'};
        const result = Meteor.call('verifyCaptcha', team.settings.captchaSecret, response);
        if (!result) return {error: 'Captcha invalid'}
      }
  
      const apiUrl = `${team.url}api/users.admin.invite?token=${team.settings.adminToken}&email=${email}`;
      const data = HTTP.get(apiUrl).data;
      const {ok, error} = data;
  
      if (ok) {
        return {result: 'An invitation has been sent to your email.'};
      } else {
        if (error === 'missing_scope') {
          return {error: 'Your code is missing the scope admin'};
        } else if (error === 'already_invited') {
          return {error: 'You have already been invited to Slack. Check for an email from feedback@slack.com.'};
        } else if (error === 'already_in_team') {
          return {error: `Already a member of this team.`};
        } else if (error === 'invite_limit_reached') {
          Teams.update({id: teamId}, {$set: {"settings.inviteLimitReached": true}});
          return createSharedInviteNoCaptcha(teamId);
        } else if (error === 'invalid_email') {
          return {error: 'Email address is invalid.'};
        } else if (error === 'user_disabled') {
          return {error: 'This user has been disabled.'};
        } else if (error === 'already_in_team') {
          return {error: 'This user is already registered.'};
        } else {
          return {error: (error.providedError) ? error.providedError : error};
        }
      }
    } catch(e) {
    
    }
  },
  createSharedInvite(teamId, response = '') {
    try {
      console.log(teamId, response);
      const team = Teams.findOne({id: teamId});
      if (team.settings.adminToken.trim() === '' && !team.settings.enableInvitations) return '';
      if (team.settings.enableCaptcha) {
        console.log('testing captcha');
        const settings = AppSettings.findOne({id: 'recaptcha'});
        if (response === '') return {error: 'Captcha invalid'};
    
        console.log(team.settings.enableLandingPage ? settings.secretKey : team.settings.captchaSecret);
        const result = Meteor.call('verifyCaptcha', team.settings.enableLandingPage ? settings.secretKey : team.settings.captchaSecret, response);
        if (!result) return {error: 'Captcha invalid'}
    
      }
  
      const apiUrl = `${team.url}api/users.admin.createSharedInvite?token=${team.settings.adminToken}&max_signups=1&expiration=0.0035&disable_email=true`;
      const data = HTTP.get(apiUrl).data;
      const {ok, error, url} = data;
  
      if (ok) {
        return {result: url};
      } else {
        return {error};
      }
    } catch(e) {
    
    }
  },
  getActiveUserCount(teamId) {
    try {
      const team = Teams.findOne({id: teamId});
      const apiUrl = `${team.url}api/users.list?token=${team.oauth.access_token}&presence=true`;
      const data = HTTP.get(apiUrl).data;
  
      let users = data.members;
      if (!users || users.length === 0) return {activeUsersError: 'Could not fetch user count'};
  
      users = users.filter(x => {
        return x.id !== 'USLACKBOT' && !x.is_bot && !x.deleted
      });
  
      let totalUsers = users.length;
      let activeUsers = users.filter(user => {
        return 'active' === user.presence
      }).length;
  
      return {totalUsers, activeUsers};
    } catch (e) {
    
    }
  },
  getTeamIcon(teamId) {
    try {
      const team = Teams.findOne({id: teamId});
      if(!team.icon) {
        const apiUrl = `${team.url}api/team.info?token=${team.oauth.access_token}`;
        const data = HTTP.get(apiUrl).data;
  
        Teams.update({id: teamId}, {$set: {icon: data.team.icon}});
        
        return data.team.icon;
      } else {
        return team.icon;
      }
    } catch(e) {
    
    }
  }
});