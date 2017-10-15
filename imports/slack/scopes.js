export default {
  user: [
    'reminders:read',
    'reminders:write',
    'im:history',
    'im:write',
    'users:read'
  ],
  admin: [
    'im:read',
    'channels:history',
    'im:history',
    'users:read',
    'bot',
    'admin',
    'channels:read',
    'channels:write',
    'chat:write:bot',
    'chat:write:user',
    'im:write',
    'reminders:read',
    'reminders:write',
    'team:read',
    'users.profile:read',
    'users.profile:write',
    'users:write',
    'users:read.email',
    'commands',
    'files:write:user'
  ]
}