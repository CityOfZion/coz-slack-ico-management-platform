Meteor.publish('getTeam', function() {
  return Teams.find({id: Meteor.user().profile.auth.team_id});
});

Meteor.publish('getTeamById', function(teamId) {
  return Teams.find({id: teamId}, {"settings.enableInvitations": 1, "settings.inviteLimitReached": 1});
});