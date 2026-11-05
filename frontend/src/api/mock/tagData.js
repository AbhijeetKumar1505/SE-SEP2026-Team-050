import { uid } from './mockUtils'

// Seed list: 30 tags in 7 groups, [name, problems so far]. IIC reviews it in Settings (I7).
// Shared with the student "Submit your problem" page (S2).
const SEED = {
  'Career direction': [['Choosing a career path', 14], ['Industry and role requirements', 22]],
  'Jobs and internships': [['Finding internships', 14], ['Job search strategy', 9], ['Technical interview preparation', 7], ['Resume and portfolio', 3]],
  'Technical skills': [['Data structures and algorithms (DSA)', 15], ['SQL and database design', 12], ['Data engineering', 18], ['Python programming', 11], ['Machine learning', 10], ['Web development', 6], ['Speech technology', 4]],
  'Higher studies and research': [['Choosing a master’s programme', 8], ['Applying abroad', 5], ['Research opportunities', 4], ['Entrance exams', 3]],
  Entrepreneurship: [['Starting a startup', 4], ['Freelancing and consulting', 2], ['Building a side project', 5]],
  'Academics and programme': [['Course selection', 9], ['Exam preparation', 7], ['Managing workload', 8], ['Projects and capstone', 6], ['Study habits', 5], ['Balancing work and study', 6]],
  'Wellbeing and motivation': [['Staying motivated', 5], ['Time management', 7], ['Dealing with burnout', 3], ['Confidence and networking', 4]],
}

export const tags = Object.entries(SEED).flatMap(([group, list]) =>
  list.map(([name, problems]) => ({ id: uid(), name, group, problems, active: true })),
)
