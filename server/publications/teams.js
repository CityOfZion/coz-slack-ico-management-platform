Meteor.publish('getTeam', function() {
  return Teams.find({id: Meteor.user().profile.auth.team_id});
});

Meteor.publish('getTeamByIdForInvite', function(teamId) {
  console.log(teamId);
  return Teams.find({id: teamId}, {fields: {id: 1, name: 1, url: 1, "settings.enableInvitations": 1, "settings.inviteLimitReached": 1, "settings.enableCaptcha": 1, "settings.enableLandingPage": 1, "settings.captchaPublicKey": 1, "icon": 1}});
});