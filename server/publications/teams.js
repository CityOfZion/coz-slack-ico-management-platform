Meteor.publish('getTeam', function() {
  return Teams.find({id: Meteor.user().profile.auth.team_id});
});