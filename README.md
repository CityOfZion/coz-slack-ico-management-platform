<p align="center">
  <img 
    src="http://res.cloudinary.com/vidsy/image/upload/v1503160820/CoZ_Icon_DARKBLUE_200x178px_oq0gxm.png" 
    width="125px"
  >
</p>

<h1 align="center">CoZ Slack ICO Management Platform
</h1>

<p align="center">
  Helps get rid of spam/scam as much as possible

</p>

## Description
As many of you know, Slack is one of the major platforms used by ICO to stay in touch with their community. However the free version of Slack has limited options and can be a danger to users new to the Crypto scene. This platform will help Slack owners manage their slack better.

## Requirements
- MeteorJS https://www.meteor.com/
- MongoDB (included in Meteor)
- MongoBooster https://mongobooster.com/
- Ngrok https://ngrok.com/

## Setup
You can just clone this repository into a directory and inside the folder do `meteor run` however you will need a url that is accessible from the internet.
If you use ngrok on Windows use the following command to start ngrok `ngrok http 3000`
and meteor with `cmd /c "set ROOT_URL=https://NGROK_URL&& meteor run"`

This will start the server and the Mongo database.

#### In Slack Apps add the following URLS:
- Redirect URL oauth: `https://NGROK_URL/_oauth/slack`
- Event Subscriptions URL: `https://NGROK_URL/slack/events/request`
- Slack command /report : `https://NGROK_URL/slack/command/report`
- Slack command /nukefromorbit : `https://NGROK_URL/slack/command/nukefromorbit`

Connect to the database with MongoBooster `localhost:3001`

You will need to insert a document into the Mongo database to be able to use this platform.

```
db.meteor_accounts_loginServiceConfiguration.insert({
	"service" : "slack",
	"clientId" : "your_slack_client_id",
	"secret" : "your_slack_secret",
	"loginStyle" : "redirect"
})
```

**Currently the platform will be available online for other Slacks to use. Be aware that it is still in beta!**

<img src="https://github.com/CityOfZion/coz-slack-ico-management-platform/blob/master/screenshot-settings.png">