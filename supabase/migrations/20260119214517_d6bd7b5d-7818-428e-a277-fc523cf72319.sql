-- Admins can view all project submissions
CREATE POLICY "Admins can view all project submissions"
ON project_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Admins can update project submissions
CREATE POLICY "Admins can update project submissions"
ON project_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);