// Edit this single file to personalize your portfolio and resume!

export const profile = {
  brand: 'ibraheem.dev',
  name: 'Ibraheem',
  role: 'Software & Cloud Engineer',
  status: 'Building in the Cloud',
  location: 'Your City, Country',
  summary:
    'Builder focused on modern web applications, cloud infrastructure, and automation. Currently completing the AWS Cloud Resume Challenge with Terraform, serverless Python APIs, and GitHub Actions CI/CD.',
  links: [
    { label: 'GitHub', href: 'https://github.com/ibbya04' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/your-handle' },
    { label: 'Email', href: 'mailto:you@example.com' },
  ],
  projects: [
    {
      name: 'AWS Cloud Resume & Portfolio',
      description:
        'Serverless portfolio and resume hosted on S3 + CloudFront with a DynamoDB-backed visitor counter API (Lambda + API Gateway), provisioned with Terraform and deployed via GitHub Actions.',
      tags: ['AWS', 'Terraform', 'Python', 'Vite', 'Tailwind CSS'],
      repo: 'https://github.com/ibbya04/portfolio',
      demo: '#',
    },
    {
      name: 'Project Two (Replace Me)',
      description:
        'Describe a project you built, the problem it solved, and one measurable result or technical highlight.',
      tags: ['JavaScript', 'Node.js', 'REST API'],
      repo: 'https://github.com/ibbya04',
      demo: '',
    },
  ],
  experience: [
    {
      role: 'Your Most Recent Role (Replace Me)',
      company: 'Company or Organization',
      period: '2025 — Present',
      location: 'Remote / City',
      highlights: [
        'Describe a key contribution using strong action verbs and measurable impact.',
        'Highlight technologies used, systems improved, or problems solved.',
      ],
    },
  ],
  skillGroups: [
    {
      category: 'Cloud & Infrastructure',
      items: ['AWS S3', 'CloudFront', 'Lambda', 'API Gateway', 'DynamoDB', 'IAM', 'Terraform'],
    },
    {
      category: 'Languages & Web',
      items: ['Python', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite'],
    },
    {
      category: 'DevOps & Tooling',
      items: ['Git', 'GitHub Actions', 'pytest', 'AWS CLI', 'Linux / Shell'],
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Cloud Practitioner (CLF-C02)',
      issuer: 'Amazon Web Services',
      status: 'In Progress',
    },
  ],
  education: [
    {
      degree: 'Your Degree or Program (Replace Me)',
      school: 'University / Institution',
      period: '2021 — 2025',
      details: 'Relevant coursework, honors, or clubs.',
    },
  ],
};
