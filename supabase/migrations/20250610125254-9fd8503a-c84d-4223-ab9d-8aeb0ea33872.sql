
-- Prima identifichiamo gli utenti senza recensioni
SELECT u.id, u.username, u.email, u.created_at
FROM users u
LEFT JOIN reviews r ON u.username = r.username
WHERE r.username IS NULL;

-- Quindi eliminiamo gli utenti che non hanno recensioni associate
DELETE FROM users 
WHERE username NOT IN (
  SELECT DISTINCT username 
  FROM reviews 
  WHERE username IS NOT NULL
);
