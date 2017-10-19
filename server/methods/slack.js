import {isAdmin} from '/imports/slack/helpers';

Meteor.methods({
  enableUser(userId, name) {
    if(!isAdmin(Meteor.user())) return false;
    
    const bot = BotStorage[Meteor.user().profile.team_id];
    if(bot) {
      bot.enableUser(userId, name, Meteor.user().user.profile.identity.user.name);
    }
  },
  importMessages() {
    if(!isAdmin(Meteor.user())) return false;
  
    const bot = BotStorage[Meteor.user().profile.team_id];
  
    if(bot) {
      bot.importMessages();
    }
  },
  importFiles() {
    if(!isAdmin(Meteor.user())) return false;
  
    const bot = BotStorage[Meteor.user().profile.team_id];
  
    if(bot) {
      bot.importFiles();
    }
  },
  createAdminEmailInvite(teamId, email) {
    const team = Teams.findOne({id: teamId});
    if(team.settings.inviteLimitReached) Meteor.call('createSharedInvite', teamId);
    if(team.settings.adminToken.trim() === '' && !team.settings.enableInvitations) return '';
  
    const apiUrl = `${team.url}api/users.admin.invite?token=${team.settings.adminToken}&email=${email}`;
    const data = HTTP.get(apiUrl).data;
    const {ok, error} = data;
    
    if(ok) {
      return 'An invitation has been sent to your email.';
    } else {
      if (error.providedError === 'missing_scope') {
        return 'Your code is missing the scope admin';
      } else if (error.providedError === 'already_invited') {
        return 'You have already been invited to Slack. Check for an email from feedback@slack.com.';
      } else if (error.providedError === 'already_in_team') {
        return `Already a member of this team.`;
      } else if(error.providedError === 'invite_limit_reached') {
        Teams.update({id: teamId}, {$set: {settings: {inviteLimitReached: true}}});
        return Meteor.call('createSharedInvite', teamId);
      } else if(error === 'invalid_email') {
        return 'Email address is invalid.';
      } else if(error === 'user_disabled') {
        return 'This user has been disabled.';
      } else if(error === 'already_in_team') {
        return 'This user is already registered.';
      } else {
        return (error.providedError) ? error.providedError : error;
      }
    }
  },
  createSharedInvite(teamId) {
    const team = Teams.findOne({id: teamId});
    if(team.settings.adminToken.trim() === '' && !team.settings.enableInvitations) return '';
    
    const apiUrl = `${team.url}api/users.admin.createSharedInvite?token=${team.settings.adminToken}&max_signups=1&expiration=0.0035&disable_email=true`;
    const data = HTTP.get(apiUrl).data;
    const {ok, error, url} = data;
    
    if(ok) {
      return url;
    } else {
      return error;
    }
  }
});