import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models and config with relative paths
import { config } from '../src/config/env';
import { User } from '../src/models/User';

// Sample user profiles with diverse backgrounds from various industries
const sampleUsers: Array<{
  email: string;
  password: string;
  name: string;
  username: string;
  profession: string;
  bio: string;
  interests: string[];
  phone: string;
  verified: boolean;
}> = [
  // Technology & Software Development
  {
    email: 'sarah.chen@example.com',
    password: 'password123',
    name: 'Sarah Chen',
    username: 'sarahchen',
    profession: 'Senior Frontend Developer',
    bio: 'Passionate about creating beautiful, accessible web experiences. Love working with React, TypeScript, and modern CSS. Always learning and sharing knowledge with the community.',
    interests: ['React', 'TypeScript', 'UI/UX Design', 'Accessibility', 'Open Source', 'Mentoring'],
    phone: '+1-555-0101',
    verified: true
  },
  {
    email: 'alex.kim@example.com',
    password: 'password123',
    name: 'Alex Kim',
    username: 'alexkim',
    profession: 'Full Stack Developer',
    bio: 'Full-stack developer with a passion for building end-to-end solutions. Experienced with React, Node.js, and PostgreSQL. Love tackling complex problems and learning new technologies.',
    interests: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Full Stack Development', 'API Development', 'GraphQL'],
    phone: '+1-555-0104',
    verified: true
  },
  {
    email: 'mike.rodriguez@example.com',
    password: 'password123',
    name: 'Mike Rodriguez',
    username: 'mikerod',
    profession: 'DevOps Engineer',
    bio: 'Cloud infrastructure specialist with expertise in AWS, Kubernetes, and automation. Passionate about building scalable systems and improving developer experience.',
    interests: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Python', 'DevOps', 'Cloud Computing'],
    phone: '+1-555-0102',
    verified: true
  },
  {
    email: 'priya.patel@example.com',
    password: 'password123',
    name: 'Priya Patel',
    username: 'priyapatel',
    profession: 'Data Scientist',
    bio: 'Machine learning engineer focused on NLP and computer vision. Love working with Python, PyTorch, and building AI solutions that make a real impact.',
    interests: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Data Science', 'NLP', 'Computer Vision'],
    phone: '+1-555-0103',
    verified: true
  },
  {
    email: 'lisa.garcia@example.com',
    password: 'password123',
    name: 'Lisa Garcia',
    username: 'lisagarcia',
    profession: 'UI/UX Designer',
    bio: 'Creative UI/UX designer with a focus on user-centered design. Love creating intuitive interfaces and conducting user research. Passionate about accessibility and inclusive design.',
    interests: ['UI/UX Design', 'Figma', 'User Research', 'Accessibility', 'Web Design', 'Graphic Design', 'Prototyping'],
    phone: '+1-555-0107',
    verified: true
  },

  // Healthcare & Medicine
  {
    email: 'dr.michael.thompson@example.com',
    password: 'password123',
    name: 'Dr. Michael Thompson',
    username: 'drthompson',
    profession: 'Cardiologist',
    bio: 'Board-certified cardiologist with 15 years of experience in interventional cardiology. Passionate about preventive medicine and patient education.',
    interests: ['Cardiology', 'Preventive Medicine', 'Medical Research', 'Patient Care', 'Heart Health', 'Medical Technology'],
    phone: '+1-555-0201',
    verified: true
  },
  {
    email: 'dr.sarah.johnson@example.com',
    password: 'password123',
    name: 'Dr. Sarah Johnson',
    username: 'drsarah',
    profession: 'Pediatrician',
    bio: 'Pediatrician specializing in child development and family medicine. Committed to providing compassionate care for children and supporting families.',
    interests: ['Pediatrics', 'Child Development', 'Family Medicine', 'Vaccination', 'Child Psychology', 'Public Health'],
    phone: '+1-555-0202',
    verified: true
  },
  {
    email: 'nurse.rachel.martinez@example.com',
    password: 'password123',
    name: 'Rachel Martinez',
    username: 'nurserachel',
    profession: 'Registered Nurse',
    bio: 'ICU nurse with expertise in critical care and emergency medicine. Passionate about patient advocacy and healthcare innovation.',
    interests: ['Critical Care', 'Emergency Medicine', 'Patient Advocacy', 'Healthcare Technology', 'Nursing Education', 'Public Health'],
    phone: '+1-555-0203',
    verified: true
  },
  {
    email: 'dr.james.wilson@example.com',
    password: 'password123',
    name: 'Dr. James Wilson',
    username: 'drjames',
    profession: 'Psychiatrist',
    bio: 'Psychiatrist specializing in mood disorders and cognitive behavioral therapy. Dedicated to mental health awareness and destigmatization.',
    interests: ['Psychiatry', 'Mental Health', 'Cognitive Behavioral Therapy', 'Mood Disorders', 'Mental Health Advocacy', 'Psychology'],
    phone: '+1-555-0204',
    verified: true
  },

  // Finance & Business
  {
    email: 'jennifer.lee@example.com',
    password: 'password123',
    name: 'Jennifer Lee',
    username: 'jenlee',
    profession: 'Investment Banker',
    bio: 'Senior investment banker specializing in M&A and capital markets. Passionate about helping companies grow and achieve their financial goals.',
    interests: ['Investment Banking', 'M&A', 'Capital Markets', 'Corporate Finance', 'Financial Modeling', 'Private Equity'],
    phone: '+1-555-0301',
    verified: true
  },
  {
    email: 'robert.chen@example.com',
    password: 'password123',
    name: 'Robert Chen',
    username: 'robertchen',
    profession: 'Financial Advisor',
    bio: 'Certified financial planner helping individuals and families achieve their financial goals through comprehensive planning and investment strategies.',
    interests: ['Financial Planning', 'Investment Strategy', 'Retirement Planning', 'Tax Planning', 'Estate Planning', 'Wealth Management'],
    phone: '+1-555-0302',
    verified: true
  },
  {
    email: 'maria.rodriguez@example.com',
    password: 'password123',
    name: 'Maria Rodriguez',
    username: 'mariarod',
    profession: 'Accounting Manager',
    bio: 'CPA with expertise in corporate accounting and financial reporting. Passionate about process improvement and team development.',
    interests: ['Accounting', 'Financial Reporting', 'Tax Compliance', 'Process Improvement', 'Team Leadership', 'Corporate Finance'],
    phone: '+1-555-0303',
    verified: true
  },
  {
    email: 'david.kim@example.com',
    password: 'password123',
    name: 'David Kim',
    username: 'davidkim',
    profession: 'Risk Manager',
    bio: 'Risk management professional specializing in operational and financial risk assessment. Committed to protecting organizational assets and reputation.',
    interests: ['Risk Management', 'Compliance', 'Audit', 'Insurance', 'Business Continuity', 'Regulatory Affairs'],
    phone: '+1-555-0304',
    verified: true
  },

  // Education & Academia
  {
    email: 'prof.anna.smith@example.com',
    password: 'password123',
    name: 'Prof. Anna Smith',
    username: 'profsmith',
    profession: 'University Professor',
    bio: 'Professor of Computer Science with research focus on artificial intelligence and machine learning. Committed to advancing knowledge and mentoring students.',
    interests: ['Artificial Intelligence', 'Machine Learning', 'Research', 'Teaching', 'Academic Publishing', 'Student Mentoring'],
    phone: '+1-555-0401',
    verified: true
  },
  {
    email: 'teacher.john.davis@example.com',
    password: 'password123',
    name: 'John Davis',
    username: 'teacherjohn',
    profession: 'High School Teacher',
    bio: 'High school mathematics teacher passionate about making math accessible and engaging for all students. Focus on innovative teaching methods.',
    interests: ['Mathematics Education', 'Teaching Innovation', 'Student Engagement', 'Educational Technology', 'Curriculum Development', 'Mentoring'],
    phone: '+1-555-0402',
    verified: true
  },
  {
    email: 'librarian.emma.brown@example.com',
    password: 'password123',
    name: 'Emma Brown',
    username: 'librarianemma',
    profession: 'Librarian',
    bio: 'Public librarian with expertise in digital literacy and community programming. Passionate about making information accessible to everyone.',
    interests: ['Information Science', 'Digital Literacy', 'Community Programming', 'Research', 'Education', 'Public Service'],
    phone: '+1-555-0403',
    verified: true
  },

  // Creative Arts & Media
  {
    email: 'artist.sophia.williams@example.com',
    password: 'password123',
    name: 'Sophia Williams',
    username: 'artistsophia',
    profession: 'Graphic Designer',
    bio: 'Award-winning graphic designer specializing in brand identity and digital marketing. Passionate about creating visual stories that connect with audiences.',
    interests: ['Graphic Design', 'Brand Identity', 'Digital Marketing', 'Typography', 'Illustration', 'Creative Direction'],
    phone: '+1-555-0501',
    verified: true
  },
  {
    email: 'photographer.marcus.jones@example.com',
    password: 'password123',
    name: 'Marcus Jones',
    username: 'marcusjones',
    profession: 'Photographer',
    bio: 'Professional photographer specializing in wedding and portrait photography. Committed to capturing authentic moments and creating lasting memories.',
    interests: ['Photography', 'Wedding Photography', 'Portrait Photography', 'Photo Editing', 'Visual Storytelling', 'Creative Arts'],
    phone: '+1-555-0502',
    verified: true
  },
  {
    email: 'writer.olivia.taylor@example.com',
    password: 'password123',
    name: 'Olivia Taylor',
    username: 'writerolivia',
    profession: 'Content Writer',
    bio: 'Freelance content writer specializing in technology and business topics. Passionate about creating engaging content that educates and informs.',
    interests: ['Content Writing', 'Copywriting', 'Digital Marketing', 'SEO', 'Technical Writing', 'Storytelling'],
    phone: '+1-555-0503',
    verified: true
  },
  {
    email: 'musician.daniel.garcia@example.com',
    password: 'password123',
    name: 'Daniel Garcia',
    username: 'danielgarcia',
    profession: 'Music Producer',
    bio: 'Music producer and audio engineer with experience in various genres. Passionate about helping artists bring their creative visions to life.',
    interests: ['Music Production', 'Audio Engineering', 'Sound Design', 'Music Technology', 'Artist Development', 'Creative Collaboration'],
    phone: '+1-555-0504',
    verified: true
  },

  // Legal & Law
  {
    email: 'attorney.jessica.white@example.com',
    password: 'password123',
    name: 'Jessica White',
    username: 'jessicawhite',
    profession: 'Corporate Attorney',
    bio: 'Corporate attorney specializing in business law and contract negotiations. Committed to providing strategic legal counsel to growing companies.',
    interests: ['Corporate Law', 'Contract Law', 'Business Law', 'Legal Strategy', 'Compliance', 'Client Advocacy'],
    phone: '+1-555-0601',
    verified: true
  },
  {
    email: 'lawyer.kevin.moore@example.com',
    password: 'password123',
    name: 'Kevin Moore',
    username: 'kevinmoore',
    profession: 'Criminal Defense Attorney',
    bio: 'Criminal defense attorney with a focus on protecting clients\' rights and ensuring fair legal representation. Committed to justice and due process.',
    interests: ['Criminal Law', 'Defense Law', 'Legal Advocacy', 'Constitutional Law', 'Client Rights', 'Justice System'],
    phone: '+1-555-0602',
    verified: true
  },

  // Engineering & Manufacturing
  {
    email: 'engineer.amanda.clark@example.com',
    password: 'password123',
    name: 'Amanda Clark',
    username: 'amandaclark',
    profession: 'Mechanical Engineer',
    bio: 'Mechanical engineer specializing in product design and manufacturing processes. Passionate about innovation and sustainable engineering solutions.',
    interests: ['Mechanical Engineering', 'Product Design', 'Manufacturing', 'CAD', 'Sustainability', 'Innovation'],
    phone: '+1-555-0701',
    verified: true
  },
  {
    email: 'engineer.carlos.lopez@example.com',
    password: 'password123',
    name: 'Carlos Lopez',
    username: 'carloslopez',
    profession: 'Civil Engineer',
    bio: 'Civil engineer with expertise in infrastructure development and project management. Committed to building sustainable and resilient communities.',
    interests: ['Civil Engineering', 'Infrastructure', 'Project Management', 'Sustainability', 'Urban Planning', 'Construction'],
    phone: '+1-555-0702',
    verified: true
  },
  {
    email: 'engineer.rachel.green@example.com',
    password: 'password123',
    name: 'Rachel Green',
    username: 'rachelgreen',
    profession: 'Environmental Engineer',
    bio: 'Environmental engineer focused on water treatment and waste management solutions. Passionate about protecting the environment through innovative engineering.',
    interests: ['Environmental Engineering', 'Water Treatment', 'Waste Management', 'Sustainability', 'Environmental Protection', 'Green Technology'],
    phone: '+1-555-0703',
    verified: true
  },

  // Marketing & Sales
  {
    email: 'marketer.brian.adams@example.com',
    password: 'password123',
    name: 'Brian Adams',
    username: 'brianadams',
    profession: 'Digital Marketing Manager',
    bio: 'Digital marketing expert specializing in social media strategy and content marketing. Passionate about building brand awareness and driving engagement.',
    interests: ['Digital Marketing', 'Social Media', 'Content Marketing', 'Brand Strategy', 'Analytics', 'Growth Marketing'],
    phone: '+1-555-0801',
    verified: true
  },
  {
    email: 'sales.sarah.miller@example.com',
    password: 'password123',
    name: 'Sarah Miller',
    username: 'sarahmiller',
    profession: 'Sales Director',
    bio: 'Sales director with a track record of building high-performing teams and exceeding revenue targets. Passionate about relationship building and customer success.',
    interests: ['Sales Leadership', 'Team Building', 'Customer Success', 'Revenue Growth', 'Business Development', 'Relationship Management'],
    phone: '+1-555-0802',
    verified: true
  },

  // Real Estate & Construction
  {
    email: 'realtor.michael.turner@example.com',
    password: 'password123',
    name: 'Michael Turner',
    username: 'michaelturner',
    profession: 'Real Estate Agent',
    bio: 'Licensed real estate agent specializing in residential properties. Committed to helping clients find their dream homes and make smart investment decisions.',
    interests: ['Real Estate', 'Property Investment', 'Home Buying', 'Market Analysis', 'Client Service', 'Negotiation'],
    phone: '+1-555-0901',
    verified: true
  },
  {
    email: 'contractor.tom.anderson@example.com',
    password: 'password123',
    name: 'Tom Anderson',
    username: 'tomanderson',
    profession: 'General Contractor',
    bio: 'Licensed general contractor with 20 years of experience in residential and commercial construction. Committed to quality workmanship and customer satisfaction.',
    interests: ['Construction', 'Project Management', 'Quality Control', 'Safety', 'Customer Service', 'Building Codes'],
    phone: '+1-555-0902',
    verified: true
  },

  // Hospitality & Tourism
  {
    email: 'chef.maria.santos@example.com',
    password: 'password123',
    name: 'Maria Santos',
    username: 'mariasantos',
    profession: 'Executive Chef',
    bio: 'Executive chef with expertise in fine dining and culinary innovation. Passionate about creating memorable dining experiences and mentoring young chefs.',
    interests: ['Culinary Arts', 'Fine Dining', 'Menu Development', 'Food Innovation', 'Team Leadership', 'Culinary Education'],
    phone: '+1-555-1001',
    verified: true
  },
  {
    email: 'hotel.james.wilson@example.com',
    password: 'password123',
    name: 'James Wilson',
    username: 'jameswilson',
    profession: 'Hotel Manager',
    bio: 'Hotel manager with experience in luxury hospitality and guest services. Committed to providing exceptional guest experiences and operational excellence.',
    interests: ['Hospitality Management', 'Guest Services', 'Operations', 'Team Leadership', 'Customer Experience', 'Hotel Industry'],
    phone: '+1-555-1002',
    verified: true
  },

  // Non-Profit & Social Services
  {
    email: 'director.lisa.thompson@example.com',
    password: 'password123',
    name: 'Lisa Thompson',
    username: 'lisathompson',
    profession: 'Non-Profit Director',
    bio: 'Non-profit director focused on community development and social impact. Passionate about creating positive change and empowering underserved communities.',
    interests: ['Non-Profit Management', 'Community Development', 'Social Impact', 'Fundraising', 'Volunteer Management', 'Social Justice'],
    phone: '+1-555-1101',
    verified: true
  },
  {
    email: 'counselor.mark.davis@example.com',
    password: 'password123',
    name: 'Mark Davis',
    username: 'markdavis',
    profession: 'Social Worker',
    bio: 'Licensed social worker specializing in family services and mental health support. Committed to helping individuals and families overcome challenges.',
    interests: ['Social Work', 'Mental Health', 'Family Services', 'Community Support', 'Crisis Intervention', 'Advocacy'],
    phone: '+1-555-1102',
    verified: true
  },

  // Agriculture & Food Production
  {
    email: 'farmer.john.martinez@example.com',
    password: 'password123',
    name: 'John Martinez',
    username: 'johnmartinez',
    profession: 'Organic Farmer',
    bio: 'Organic farmer committed to sustainable agriculture and environmental stewardship. Passionate about growing healthy food and supporting local communities.',
    interests: ['Organic Farming', 'Sustainable Agriculture', 'Environmental Stewardship', 'Local Food', 'Soil Health', 'Community Supported Agriculture'],
    phone: '+1-555-1201',
    verified: true
  },

  // Transportation & Logistics
  {
    email: 'pilot.anna.johnson@example.com',
    password: 'password123',
    name: 'Anna Johnson',
    username: 'annajohnson',
    profession: 'Commercial Pilot',
    bio: 'Commercial airline pilot with international flight experience. Passionate about aviation safety and mentoring the next generation of pilots.',
    interests: ['Aviation', 'Flight Safety', 'International Travel', 'Pilot Training', 'Aircraft Systems', 'Aviation Technology'],
    phone: '+1-555-1301',
    verified: true
  },
  {
    email: 'logistics.steve.brown@example.com',
    password: 'password123',
    name: 'Steve Brown',
    username: 'stevebrown',
    profession: 'Supply Chain Manager',
    bio: 'Supply chain manager with expertise in logistics optimization and vendor management. Committed to improving efficiency and reducing costs.',
    interests: ['Supply Chain Management', 'Logistics', 'Vendor Management', 'Process Optimization', 'Inventory Management', 'Operations'],
    phone: '+1-555-1302',
    verified: true
  },

  // Sports & Fitness
  {
    email: 'trainer.mike.rodriguez@example.com',
    password: 'password123',
    name: 'Mike Rodriguez',
    username: 'mikerodriguez',
    profession: 'Personal Trainer',
    bio: 'Certified personal trainer specializing in strength training and fitness coaching. Passionate about helping clients achieve their health and fitness goals.',
    interests: ['Personal Training', 'Strength Training', 'Fitness Coaching', 'Nutrition', 'Health & Wellness', 'Athletic Performance'],
    phone: '+1-555-1401',
    verified: true
  },
  {
    email: 'coach.sarah.williams@example.com',
    password: 'password123',
    name: 'Sarah Williams',
    username: 'sarahwilliams',
    profession: 'Sports Coach',
    bio: 'High school basketball coach with a focus on player development and team building. Committed to teaching life skills through sports.',
    interests: ['Sports Coaching', 'Player Development', 'Team Building', 'Athletic Training', 'Youth Development', 'Leadership'],
    phone: '+1-555-1402',
    verified: true
  },

  // Government & Public Service
  {
    email: 'official.david.garcia@example.com',
    password: 'password123',
    name: 'David Garcia',
    username: 'davidgarcia',
    profession: 'City Planner',
    bio: 'City planner focused on sustainable urban development and community engagement. Committed to creating livable and equitable cities.',
    interests: ['Urban Planning', 'Sustainable Development', 'Community Engagement', 'Public Policy', 'Environmental Planning', 'Social Equity'],
    phone: '+1-555-1501',
    verified: true
  },
  {
    email: 'officer.jennifer.lee@example.com',
    password: 'password123',
    name: 'Jennifer Lee',
    username: 'jenniferlee',
    profession: 'Police Officer',
    bio: 'Police officer committed to community policing and public safety. Passionate about building trust between law enforcement and the community.',
    interests: ['Community Policing', 'Public Safety', 'Criminal Justice', 'Community Relations', 'Law Enforcement', 'Public Service'],
    phone: '+1-555-1502',
    verified: true
  },

  // Retail & Customer Service
  {
    email: 'manager.kevin.taylor@example.com',
    password: 'password123',
    name: 'Kevin Taylor',
    username: 'kevintaylor',
    profession: 'Retail Manager',
    bio: 'Retail manager with expertise in customer service and team leadership. Committed to creating positive shopping experiences and developing staff.',
    interests: ['Retail Management', 'Customer Service', 'Team Leadership', 'Sales', 'Inventory Management', 'Staff Development'],
    phone: '+1-555-1601',
    verified: true
  },

  // Consulting & Professional Services
  {
    email: 'consultant.amanda.white@example.com',
    password: 'password123',
    name: 'Amanda White',
    username: 'amandawhite',
    profession: 'Management Consultant',
    bio: 'Management consultant specializing in organizational strategy and process improvement. Passionate about helping businesses optimize their operations.',
    interests: ['Management Consulting', 'Strategy', 'Process Improvement', 'Change Management', 'Business Analysis', 'Organizational Development'],
    phone: '+1-555-1701',
    verified: true
  },

  // Technology Support & IT
  {
    email: 'support.carlos.martinez@example.com',
    password: 'password123',
    name: 'Carlos Martinez',
    username: 'carlosmartinez',
    profession: 'IT Support Specialist',
    bio: 'IT support specialist with expertise in troubleshooting and system administration. Committed to providing excellent technical support and user training.',
    interests: ['IT Support', 'System Administration', 'Troubleshooting', 'User Training', 'Technical Documentation', 'Help Desk'],
    phone: '+1-555-1801',
    verified: true
  },

  // Research & Development
  {
    email: 'researcher.rachel.kim@example.com',
    password: 'password123',
    name: 'Rachel Kim',
    username: 'rachelkim',
    profession: 'Research Scientist',
    bio: 'Research scientist specializing in biotechnology and drug development. Passionate about advancing medical research and improving patient outcomes.',
    interests: ['Biotechnology', 'Drug Development', 'Medical Research', 'Laboratory Science', 'Clinical Trials', 'Scientific Innovation'],
    phone: '+1-555-1901',
    verified: true
  },

  // Entertainment & Media
  {
    email: 'producer.marcus.johnson@example.com',
    password: 'password123',
    name: 'Marcus Johnson',
    username: 'marcusjohnson',
    profession: 'Film Producer',
    bio: 'Independent film producer with a focus on documentary and social impact films. Committed to telling stories that matter and inspire change.',
    interests: ['Film Production', 'Documentary', 'Social Impact', 'Storytelling', 'Media', 'Creative Direction'],
    phone: '+1-555-2001',
    verified: true
  },

  // Architecture & Design
  {
    email: 'architect.olivia.davis@example.com',
    password: 'password123',
    name: 'Olivia Davis',
    username: 'oliviadavis',
    profession: 'Architect',
    bio: 'Licensed architect specializing in sustainable design and green building. Passionate about creating environmentally responsible and beautiful spaces.',
    interests: ['Architecture', 'Sustainable Design', 'Green Building', 'Urban Design', 'Environmental Design', 'Building Technology'],
    phone: '+1-555-2101',
    verified: true
  },

  // Veterinary & Animal Care
  {
    email: 'vet.dr.sophia.wilson@example.com',
    password: 'password123',
    name: 'Dr. Sophia Wilson',
    username: 'drsophia',
    profession: 'Veterinarian',
    bio: 'Veterinarian specializing in small animal medicine and surgery. Committed to providing compassionate care for pets and supporting their families.',
    interests: ['Veterinary Medicine', 'Small Animal Care', 'Surgery', 'Animal Welfare', 'Pet Health', 'Veterinary Technology'],
    phone: '+1-555-2201',
    verified: true
  },

  // Human Resources & Talent
  {
    email: 'hr.daniel.brown@example.com',
    password: 'password123',
    name: 'Daniel Brown',
    username: 'danielbrown',
    profession: 'HR Manager',
    bio: 'HR manager with expertise in talent acquisition and employee development. Passionate about creating inclusive workplaces and supporting employee growth.',
    interests: ['Human Resources', 'Talent Acquisition', 'Employee Development', 'Workplace Culture', 'Diversity & Inclusion', 'Performance Management'],
    phone: '+1-555-2301',
    verified: true
  },

  // Insurance & Risk
  {
    email: 'agent.maria.garcia@example.com',
    password: 'password123',
    name: 'Maria Garcia',
    username: 'mariagarcia',
    profession: 'Insurance Agent',
    bio: 'Licensed insurance agent specializing in life and health insurance. Committed to helping clients protect their families and assets.',
    interests: ['Insurance', 'Life Insurance', 'Health Insurance', 'Risk Management', 'Financial Planning', 'Client Service'],
    phone: '+1-555-2401',
    verified: true
  },

  // Telecommunications
  {
    email: 'tech.james.miller@example.com',
    password: 'password123',
    name: 'James Miller',
    username: 'jamesmiller',
    profession: 'Telecommunications Engineer',
    bio: 'Telecommunications engineer with expertise in network infrastructure and wireless technologies. Passionate about connecting people and communities.',
    interests: ['Telecommunications', 'Network Infrastructure', 'Wireless Technology', '5G', 'Network Security', 'Communication Systems'],
    phone: '+1-555-2501',
    verified: true
  },

  // Environmental & Sustainability
  {
    email: 'scientist.emma.taylor@example.com',
    password: 'password123',
    name: 'Emma Taylor',
    username: 'emmataylor',
    profession: 'Environmental Scientist',
    bio: 'Environmental scientist specializing in climate change research and sustainability consulting. Committed to protecting the planet for future generations.',
    interests: ['Environmental Science', 'Climate Change', 'Sustainability', 'Environmental Policy', 'Research', 'Conservation'],
    phone: '+1-555-2601',
    verified: true
  },

  // Fashion & Beauty
  {
    email: 'designer.sophia.anderson@example.com',
    password: 'password123',
    name: 'Sophia Anderson',
    username: 'sophiaanderson',
    profession: 'Fashion Designer',
    bio: 'Fashion designer with a focus on sustainable and ethical fashion. Passionate about creating beautiful, responsible clothing that makes a positive impact.',
    interests: ['Fashion Design', 'Sustainable Fashion', 'Ethical Fashion', 'Textile Design', 'Fashion Technology', 'Creative Arts'],
    phone: '+1-555-2701',
    verified: true
  },

  // Food & Beverage
  {
    email: 'sommelier.marcus.white@example.com',
    password: 'password123',
    name: 'Marcus White',
    username: 'marcuswhite',
    profession: 'Sommelier',
    bio: 'Certified sommelier with expertise in wine selection and food pairing. Passionate about creating memorable dining experiences through perfect wine matches.',
    interests: ['Wine', 'Food Pairing', 'Culinary Arts', 'Hospitality', 'Beverage Management', 'Tasting'],
    phone: '+1-555-2801',
    verified: true
  },

  // Mental Health & Wellness
  {
    email: 'therapist.olivia.martinez@example.com',
    password: 'password123',
    name: 'Olivia Martinez',
    username: 'oliviamartinez',
    profession: 'Licensed Therapist',
    bio: 'Licensed therapist specializing in cognitive behavioral therapy and anxiety treatment. Committed to helping clients improve their mental health and well-being.',
    interests: ['Therapy', 'Mental Health', 'Cognitive Behavioral Therapy', 'Anxiety Treatment', 'Counseling', 'Wellness'],
    phone: '+1-555-2901',
    verified: true
  },

  // Energy & Utilities
  {
    email: 'engineer.daniel.thompson@example.com',
    password: 'password123',
    name: 'Daniel Thompson',
    username: 'danielthompson',
    profession: 'Energy Engineer',
    bio: 'Energy engineer specializing in renewable energy systems and energy efficiency. Passionate about creating sustainable energy solutions for the future.',
    interests: ['Renewable Energy', 'Energy Efficiency', 'Solar Power', 'Wind Energy', 'Sustainability', 'Clean Technology'],
    phone: '+1-555-3001',
    verified: true
  },

  // Security & Safety
  {
    email: 'security.maria.johnson@example.com',
    password: 'password123',
    name: 'Maria Johnson',
    username: 'mariajohnson',
    profession: 'Security Consultant',
    bio: 'Security consultant specializing in physical and cybersecurity assessments. Committed to protecting organizations and individuals from threats.',
    interests: ['Security Consulting', 'Physical Security', 'Cybersecurity', 'Risk Assessment', 'Threat Analysis', 'Security Technology'],
    phone: '+1-555-3101',
    verified: true
  },

  // Transportation & Automotive
  {
    email: 'mechanic.james.davis@example.com',
    password: 'password123',
    name: 'James Davis',
    username: 'jamesdavis',
    profession: 'Automotive Technician',
    bio: 'Certified automotive technician with expertise in hybrid and electric vehicle systems. Passionate about keeping vehicles running safely and efficiently.',
    interests: ['Automotive Repair', 'Hybrid Vehicles', 'Electric Vehicles', 'Diagnostics', 'Mechanical Engineering', 'Vehicle Technology'],
    phone: '+1-555-3201',
    verified: true
  },

  // Publishing & Media
  {
    email: 'editor.rachel.wilson@example.com',
    password: 'password123',
    name: 'Rachel Wilson',
    username: 'rachelwilson',
    profession: 'Book Editor',
    bio: 'Book editor specializing in fiction and non-fiction manuscripts. Committed to helping authors refine their work and reach their audience.',
    interests: ['Book Editing', 'Publishing', 'Writing', 'Literature', 'Content Development', 'Author Relations'],
    phone: '+1-555-3301',
    verified: true
  },

  // Event Planning & Management
  {
    email: 'planner.sophia.garcia@example.com',
    password: 'password123',
    name: 'Sophia Garcia',
    username: 'sophiagarcia',
    profession: 'Event Planner',
    bio: 'Professional event planner specializing in corporate events and weddings. Passionate about creating memorable experiences and seamless execution.',
    interests: ['Event Planning', 'Wedding Planning', 'Corporate Events', 'Project Management', 'Vendor Relations', 'Creative Design'],
    phone: '+1-555-3401',
    verified: true
  },

  // Quality Assurance & Testing
  {
    email: 'tester.marcus.lee@example.com',
    password: 'password123',
    name: 'Marcus Lee',
    username: 'marcuslee',
    profession: 'QA Engineer',
    bio: 'QA engineer with expertise in software testing and quality assurance processes. Committed to ensuring software reliability and user satisfaction.',
    interests: ['Software Testing', 'Quality Assurance', 'Test Automation', 'Bug Tracking', 'User Experience', 'Process Improvement'],
    phone: '+1-555-3501',
    verified: true
  },

  // International Relations & Diplomacy
  {
    email: 'diplomat.olivia.brown@example.com',
    password: 'password123',
    name: 'Olivia Brown',
    username: 'oliviabrown',
    profession: 'Foreign Service Officer',
    bio: 'Foreign service officer with experience in international relations and diplomatic affairs. Committed to promoting peace and understanding between nations.',
    interests: ['International Relations', 'Diplomacy', 'Foreign Policy', 'Cultural Exchange', 'Language', 'Global Affairs'],
    phone: '+1-555-3601',
    verified: true
  },

  // Interior Design & Home
  {
    email: 'designer.daniel.white@example.com',
    password: 'password123',
    name: 'Daniel White',
    username: 'danielwhite',
    profession: 'Interior Designer',
    bio: 'Interior designer specializing in residential and commercial spaces. Passionate about creating functional and beautiful environments that reflect clients\' personalities.',
    interests: ['Interior Design', 'Space Planning', 'Color Theory', 'Furniture Design', 'Home Decor', 'Commercial Design'],
    phone: '+1-555-3701',
    verified: true
  },

  // Translation & Language Services
  {
    email: 'translator.maria.taylor@example.com',
    password: 'password123',
    name: 'Maria Taylor',
    username: 'mariataylor',
    profession: 'Professional Translator',
    bio: 'Professional translator specializing in legal and technical documents. Committed to accurate and culturally appropriate translations.',
    interests: ['Translation', 'Language Services', 'Legal Translation', 'Technical Writing', 'Cultural Studies', 'Communication'],
    phone: '+1-555-3801',
    verified: true
  },

  // Fitness & Wellness
  {
    email: 'yoga.james.martinez@example.com',
    password: 'password123',
    name: 'James Martinez',
    username: 'jamesmartinez',
    profession: 'Yoga Instructor',
    bio: 'Certified yoga instructor specializing in Hatha and Vinyasa yoga. Committed to promoting physical and mental wellness through mindful movement.',
    interests: ['Yoga', 'Mindfulness', 'Wellness', 'Meditation', 'Physical Fitness', 'Holistic Health'],
    phone: '+1-555-3901',
    verified: true
  },

  // Technology & Innovation
  {
    email: 'innovator.rachel.anderson@example.com',
    password: 'password123',
    name: 'Rachel Anderson',
    username: 'rachelanderson',
    profession: 'Innovation Manager',
    bio: 'Innovation manager focused on emerging technologies and digital transformation. Passionate about helping organizations adapt to technological change.',
    interests: ['Innovation', 'Digital Transformation', 'Emerging Technologies', 'Change Management', 'Technology Strategy', 'Future of Work'],
    phone: '+1-555-4001',
    verified: true
  },

  // Additional diverse users to reach 100+
  {
    email: 'nurse.practitioner.sophia.clark@example.com',
    password: 'password123',
    name: 'Sophia Clark',
    username: 'sophiaclark',
    profession: 'Nurse Practitioner',
    bio: 'Nurse practitioner specializing in family medicine and preventive care. Committed to providing comprehensive healthcare to patients of all ages.',
    interests: ['Nurse Practitioner', 'Family Medicine', 'Preventive Care', 'Patient Education', 'Healthcare', 'Primary Care'],
    phone: '+1-555-4101',
    verified: true
  },
  {
    email: 'pharmacist.marcus.wilson@example.com',
    password: 'password123',
    name: 'Marcus Wilson',
    username: 'marcuswilson',
    profession: 'Pharmacist',
    bio: 'Clinical pharmacist with expertise in medication therapy management and patient counseling. Passionate about ensuring safe and effective medication use.',
    interests: ['Pharmacy', 'Medication Therapy', 'Patient Counseling', 'Clinical Pharmacy', 'Drug Information', 'Healthcare'],
    phone: '+1-555-4102',
    verified: true
  },
  {
    email: 'dietitian.olivia.garcia@example.com',
    password: 'password123',
    name: 'Olivia Garcia',
    username: 'oliviagarcia',
    profession: 'Registered Dietitian',
    bio: 'Registered dietitian specializing in sports nutrition and chronic disease management. Committed to helping clients achieve optimal health through nutrition.',
    interests: ['Nutrition', 'Sports Nutrition', 'Chronic Disease', 'Meal Planning', 'Health Education', 'Wellness'],
    phone: '+1-555-4103',
    verified: true
  },
  {
    email: 'physical.therapist.daniel.lee@example.com',
    password: 'password123',
    name: 'Daniel Lee',
    username: 'daniellee',
    profession: 'Physical Therapist',
    bio: 'Physical therapist specializing in orthopedic rehabilitation and sports medicine. Passionate about helping patients recover and improve their quality of life.',
    interests: ['Physical Therapy', 'Orthopedic Rehabilitation', 'Sports Medicine', 'Pain Management', 'Movement Analysis', 'Patient Care'],
    phone: '+1-555-4104',
    verified: true
  },
  {
    email: 'occupational.therapist.maria.brown@example.com',
    password: 'password123',
    name: 'Maria Brown',
    username: 'mariabrown',
    profession: 'Occupational Therapist',
    bio: 'Occupational therapist specializing in pediatric and adult rehabilitation. Committed to helping clients achieve independence in daily activities.',
    interests: ['Occupational Therapy', 'Pediatric Therapy', 'Rehabilitation', 'Adaptive Equipment', 'Patient Care', 'Functional Assessment'],
    phone: '+1-555-4105',
    verified: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - remove this if you want to keep existing data)
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create users
    const createdUsers: InstanceType<typeof User>[] = [];
    
    for (const userData of sampleUsers) {
      // Don't hash password here - the User model's pre('save') hook will handle it
      // Create user
      const user = new User({
        ...userData,
        password: userData.password, // Use plain password, let the model hash it
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log(`\n🎉 Successfully seeded database with ${createdUsers.length} users!`);
    console.log('\n📊 User Summary:');
    
    // Display user summary
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (@${user.username})`);
      console.log(`   Profession: ${user.profession}`);
      console.log(`   Interests: ${user.interests?.join(', ')}`);
      console.log(`   Email: ${user.email}`);
      console.log('');
    });

    console.log('🔐 All users have password: password123');
    console.log('📧 You can login with any of the emails above');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
