SyncedCron.add({
  name: 'File remover',
  schedule: function(parser) {
    return parser.recur().every(6).hour();
  },
  job: function() {
    Teams.find({}).forEach(team => {
      if(team.settings.limitFileUploads && team.settings.fileExpireDays > 0) {
        const bot = BotStorage[team.id];
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - team.settings.fileExpireDays);
        const query = {team: team.id, dateUploaded: {$lt: checkDate}};
        const files = Files.find(query)
        if(files.count() > 0) {
          files.forEach(file => {
            Files.remove(file);
            bot.deleteFile(file.id);
          })
        }
      }
    })
  }
});

SyncedCron.add({
  name: 'Message remover',
  schedule: function(parser) {
    return parser.recur().every(6).hour();
  },
  job: function() {
    Teams.find({}).forEach(team => {
      if(team.settings.deleteOldMessages && team.settings.messageExpireDays > 0) {
        const bot = BotStorage[team.id];
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - team.settings.messageExpireDays);
        const query = {team: team.id, datePosted: {$lt: checkDate}};
        const messages = Messages.find(query);
        if(messages.count() > 0) {
          messages.forEach(message => {
            Messages.remove(message);
            bot.deleteMessage(message.ts, message.channel);
          })
        }
      }
    })
  }
});

SyncedCron.start();
