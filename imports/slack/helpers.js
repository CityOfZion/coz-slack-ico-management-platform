const isAdmin = user => {
  if(!user || !user.profile) return false;
  const profile = user.profile.user;
  return profile && (profile.is_admin || profile.is_owner || profile.is_primary_owner);
};

const parseUserName = userString => {
  const [userId, username] = userString.replace('<', '').replace('>', '').replace('@', '').split('|');
  return {
    userId,
    username
  }
};

export {
  isAdmin,
  parseUserName
}