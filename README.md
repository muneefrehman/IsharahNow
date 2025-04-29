# IsharahNow - AI-Driven Sign Language Interpretation System

In recent years, advancements in artificial intelligence and computer vision have paved the way for transformative solutions across diverse fields. As society embraces inclusivity and strives for accessible communication, the need for technology that bridges linguistic gaps has never been more critical. IsharahNow, our sign language interpretation system, addresses this need by utilizing state-of-the-art AI, speech recognition, and computer vision techniques. This innovative system translates spoken language into visual sign language, making communication smoother and more accessible for the deaf and hard-of-hearing community, thus promoting inclusivity and enhancing social interaction.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 📁 Project Structure
- `app/` - Defines the structure and layout of all pages and core routes
- `components/` - Contains all reusable UI components used across pages
- `hooks/` - Provides custom React hooks to fetch and manage data
- `lib/` - Houses utility/helper functions shared across the project
- `providers/` - Manages application context, mainly video call streaming
- `constants/` - Stores application-wide constants like meeting types
- `public/` - Contains icons, images, and static assets served by the frontend

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/muneefrehman/IsharahNow.git
cd IsharahNow
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in frontend with keys such as:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_publishable_key>
CLERK_SECRET_KEY=<your_secret_key>

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_STREAM_API_KEY=<your_stream_api_key>
STREAM_SECRET_KEY=<your_stream_secret_key>

NEXT_PUBLIC_BASE_URL=localhost:3000

NEXT_PUBLIC_AWS_ACCESS_KEY_ID=<your_aws_access_key_id>
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=<your_aws_secret_access_key>
NEXT_PUBLIC_AWS_REGION=<your_aws_region>
```

### 4. Run Frontend Locally

```bash
npm run dev
```

### 5. Test Connectivity

Visit [http://localhost:3000](http://localhost:3000) to verify the frontend is working and connected to backend APIs.

---

## 🔑 Getting Your API Keys

To run this project locally, you’ll need to set up several environment variables. Here’s how you can obtain them:

### 1. Clerk Keys
- Sign up at [Clerk](https://clerk.dev) and create a new application.
- Go to the ```API Keys``` section in your dashboard to get:

  - ```NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY```
  - ```CLERK_SECRET_KEY```

- Set redirect URLs for:

  - ```NEXT_PUBLIC_CLERK_SIGN_IN_URL```
  - ```NEXT_PUBLIC_CLERK_SIGN_UP_URL```

### 2. Stream Keys
- Create an account at [Stream](https://getstream.io).
- In your dashboard, create a new app and retrieve:

  - ```NEXT_PUBLIC_STREAM_API_KEY```
  - ```STREAM_SECRET_KEY```

### 3. AWS Credentials
- Log in to your [AWS Console](https://console.aws.amazon.com/).
- Go to ```IAM``` > ```Users```, create a new user with programmatic access.
- Attach permissions (e.g., S3 Full Access if using S3) and download:

  - ```NEXT_PUBLIC_AWS_ACCESS_KEY_ID```
  - ```NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY```

- Set the ```NEXT_PUBLIC_AWS_REGION``` (e.g., us-east-1, ap-south-1, etc.)

### 4. Base URL
- Set ```NEXT_PUBLIC_BASE_URL``` to your development URL, usually ```localhost:3000```.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
