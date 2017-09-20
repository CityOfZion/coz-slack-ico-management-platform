Meteor.methods({
  removeResume() {
    const userId = Meteor.userId();
    Meteor.users.update({_id: userId}, {$unset: {"services.resume": 1}}, {multi: true});
  }
});