import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models and config with relative paths
import { config } from '../src/config/env';
import { User } from '../src/models/User';

// Sample user profiles with diverse backgrounds
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
    email: 'emma.wilson@example.com',
    password: 'password123',
    name: 'Emma Wilson',
    username: 'emmawilson',
    profession: 'Mobile App Developer',
    bio: 'Mobile developer specializing in React Native and Flutter. Passionate about creating smooth, native-like mobile experiences. Love working on cross-platform solutions.',
    interests: ['React Native', 'Flutter', 'Mobile Development', 'iOS Development', 'Android Development', 'JavaScript', 'Dart'],
    phone: '+1-555-0105',
    verified: true
  },
  {
    email: 'david.brown@example.com',
    password: 'password123',
    name: 'David Brown',
    username: 'davidbrown',
    profession: 'Backend Developer',
    bio: 'Backend developer with expertise in Java, Spring Boot, and microservices architecture. Passionate about building robust, scalable systems and API design.',
    interests: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Redis', 'Backend Development', 'API Development'],
    phone: '+1-555-0106',
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
  {
    email: 'james.lee@example.com',
    password: 'password123',
    name: 'James Lee',
    username: 'jameslee',
    profession: 'Cybersecurity Engineer',
    bio: 'Cybersecurity specialist focused on application security and threat modeling. Passionate about protecting systems and educating teams about security best practices.',
    interests: ['Cybersecurity', 'Application Security', 'Penetration Testing', 'Python', 'Linux', 'Networking', 'Security'],
    phone: '+1-555-0108',
    verified: true
  },
  {
    email: 'maria.silva@example.com',
    password: 'password123',
    name: 'Maria Silva',
    username: 'mariasilva',
    profession: 'Blockchain Developer',
    bio: 'Blockchain developer with expertise in Solidity, Web3, and DeFi protocols. Passionate about decentralized technologies and building the future of finance.',
    interests: ['Blockchain', 'Solidity', 'Web3', 'DeFi', 'Smart Contracts', 'JavaScript', 'Python'],
    phone: '+1-555-0109',
    verified: true
  },
  {
    email: 'ryan.taylor@example.com',
    password: 'password123',
    name: 'Ryan Taylor',
    username: 'ryantaylor',
    profession: 'Game Developer',
    bio: 'Game developer with experience in Unity, C#, and Unreal Engine. Love creating immersive gaming experiences and exploring new technologies in game development.',
    interests: ['Game Development', 'Unity', 'C#', 'Unreal Engine', 'C++', '3D Modeling', 'Animation'],
    phone: '+1-555-0110',
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
