Meteor.publish('recaptchaPublicKey', function() {
  return AppSettings.find({id: "recaptcha"}, {fields: {publicKey: 1}});
});