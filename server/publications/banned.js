Meteor.publish('banned', function() {
  const banned = Banned.find({team_id: Meteor.user().profile.auth.team_id});
  return banned;
});