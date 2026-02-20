import { Navigate } from 'react-router-dom';

// Redirect legacy /glucose/upload to the canonical /data-upload page (Issue 104)
export default function GlucoseUpload() {
  return <Navigate to="/data-upload" replace />;
}
