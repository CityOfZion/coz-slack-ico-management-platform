// import { Meteor } from 'meteor/meteor';
// const WebClient = require('@slack/client').WebClient;
//
// SyncedCron.add({
//   name: 'Check reminders',
//   schedule: function(parser) {
//     return parser.recur().every(300).second();
//   },
//   job: function() {
//     const users = Meteor.users.find({});
//     users.forEach(async user => {
//       const web = new WebClient(user.services.slack.accessToken);
//       const reminders = await web.reminders.list();
//       if(reminders.ok) {
//         reminders.reminders.forEach(async reminder => {
//           const creator = Meteor.users.findOne({"services.slack.id": reminder.creator});
//           if(!(creator.profile.user.is_admin || creator.profile.user.is_owner || creator.profile.user.is_primary_owner || reminder.user === reminder.creator)) {
//             const deleted = await web.reminders.delete(reminder.id);
//             console.log('deleted', deleted);
//           }
//         });
//       }
//     })
//   }
// });
//
// SyncedCron.start();
