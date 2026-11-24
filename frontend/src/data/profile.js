// Edit this single file to personalize your portfolio and resume!

export const profile = {
  brand: 'ibraheem.dev',
  name: 'Ibraheem',
  role: 'Software & Cloud Engineer',
  location: 'Your City, Country',
  summary:
    'Software & cloud engineer building modern web applications, serverless cloud infrastructure, and developer tools with AWS, Terraform, and Python.',
  links: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/ibbya04' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/your-handle' },
    { id: 'email', label: 'Email', href: 'mailto:you@example.com' },
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
  projects: [
    {
      name: 'AWS Cloud Resume & Portfolio',
      description:
        'Serverless portfolio hosted on S3 + CloudFront with a DynamoDB-backed visitor counter API (Lambda + API Gateway), provisioned with Terraform and deployed via GitHub Actions.',
      image: '/projects/cloud-resume.svg',
      imageAlt: 'AWS Cloud Resume & Portfolio homepage preview',
      repo: 'https://github.com/ibbya04/portfolio',
      blog: 'https://github.com/ibbya04/portfolio/blob/main/docs/blog-post.md',
      demo: 'https://dd2cjuvwfp75y.cloudfront.net',
    },
    {
      name: 'Project Two (Replace Me)',
      description:
        'Describe a project you built, the problem it solved, and one measurable result or technical highlight.',
      image: '/projects/project-placeholder.svg',
      imageAlt: 'Project Two homepage preview',
      repo: 'https://github.com/ibbya04',
      blog: '',
      demo: '',
    },
  ],
};
