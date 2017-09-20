Meteor.publish('getTeam', function() {
  return Teams.find({id: Meteor.user().profile.team_id});
});