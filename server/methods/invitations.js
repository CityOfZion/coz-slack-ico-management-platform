Meteor.methods({
  verifyCaptcha(secret, token) {
    console.log(secret, token);
    const request = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      params: {
        secret: secret,
        response: token
      }
    };
    
    const data = HTTP.call('POST', 'https://www.google.com/recaptcha/api/siteverify', request).data;
  
    return data.success;
  }
});