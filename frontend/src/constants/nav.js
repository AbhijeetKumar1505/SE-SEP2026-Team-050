// [path, label] per role.
export const NAV_LINKS = {
  student: [
    ['/student', 'My problem'],
    ['/student/mentorship', 'Mentorship'],
    ['/student/profile', 'Profile'],
  ],
  mentor: [
    ['/mentor', 'Dashboard'],
    ['/mentor/availability', 'Availability & contact'],
  ],
  iic: [
    ['/iic', 'Problem queue'],
    ['/iic/mentors', 'Mentor pool'],
    ['/iic/students', 'Registered students'],
    ['/iic/monitoring', 'Monitoring'],
    ['/iic/settings', 'Settings'],
  ],
  leadership: [['/leadership', 'Programme insights']],
}

export const ROLE_LABELS = { student: 'Student', mentor: 'Mentor', iic: 'IIC', leadership: 'Leadership' }
