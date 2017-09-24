const isAdmin = user => {
  if(!user || !user.profile) return false;
  const hasProfile = !!user.profile.info || !!user.profile.user;
  if(!hasProfile) {
    return user.is_admin || user.is_owner || user.is_primary_owner;
  } else {
    const profile = user.profile.info.user || user.profile.user;
    return profile && (profile.is_admin || profile.is_owner || profile.is_primary_owner);
  }
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