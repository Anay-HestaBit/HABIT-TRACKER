const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const safeUser = user.length <= 1 ? '*' : `${user[0]}***`;
  return `${safeUser}@${domain}`;
};

module.exports = { maskEmail };
