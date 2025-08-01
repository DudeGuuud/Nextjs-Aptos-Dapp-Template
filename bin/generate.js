#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(chalk.blue('🚀 Next.js Aptos dApp Template Generator'));
  console.log(chalk.gray('Creates a modern Aptos dApp with Next.js\n'));
  console.log(chalk.cyan('Usage:'));
  console.log('  npx create-nextjs-aptos-dapp-template');
  console.log('  create-nextjs-aptos-dapp-template\n');
  console.log(chalk.cyan('Options:'));
  console.log('  --help, -h    Show this help message');
  console.log('  --version     Show version number\n');
  console.log(chalk.cyan('Example:'));
  console.log('  npx create-nextjs-aptos-dapp-template');
  process.exit(0);
}

// Check for version flag
if (process.argv.includes('--version')) {
  (async () => {
    const packageJson = await fs.readJson(path.join(__dirname, '..', 'package.json'));
    console.log(packageJson.version);
    process.exit(0);
  })();
} else {
  // Only run the generator if not showing help or version
  generateProject();
}

async function generateProject() {
  console.log(chalk.blue('🚀 Welcome to Nextjs Aptos dApp Template Generator!'));
  console.log(chalk.gray('This tool will help you create a modern Aptos dApp with Next.js\n'));

  const questions = [
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'my-aptos-dapp',
      validate: (input) => {
        if (!input.trim()) {
          return 'Project name cannot be empty';
        }
        if (!/^[a-z0-9-_]+$/.test(input)) {
          return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'network',
      message: 'Which Aptos network do you want to use?',
      choices: [
        { name: 'Testnet (Testing)', value: 'testnet' },
        { name: 'Devnet (Development)', value: 'devnet' },
        { name: 'Mainnet (Production)', value: 'mainnet' }
      ],
      default: 'testnet'
    }
  ];

  const answers = await inquirer.prompt(questions);
  const templateDir = path.join(__dirname, '..', 'template');
  const targetDir = path.join(process.cwd(), answers.projectName);

  try {
    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
      console.error(chalk.red(`❌ Error: Directory ${answers.projectName} already exists.`));
      process.exit(1);
    }

    console.log(chalk.yellow('📁 Creating project directory...'));
    // Copy template to target directory
    await fs.copy(templateDir, targetDir);
    console.log(chalk.green(`✅ Created project directory: ${targetDir}`));

    // Update package.json
    console.log(chalk.yellow('📝 Updating package.json...'));
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = answers.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('✅ Updated package.json'));

    // Create .env file
    console.log(chalk.yellow('🔧 Creating .env file...'));
    const envPath = path.join(targetDir, '.env');


    const envContent = `# 网络配置 - 支持 Aptos 和 Movement 网络
NEXT_PUBLIC_NETWORK=testnet

# 其他网络选项:
# NEXT_PUBLIC_NETWORK=devnet
# NEXT_PUBLIC_NETWORK=mainnet
# NEXT_PUBLIC_NETWORK=movement-testnet
# NEXT_PUBLIC_NETWORK=movement-mainnet

# 自定义节点配置 (可选 - 用于 Movement 网络或自定义 Aptos 节点)
# NEXT_PUBLIC_NODE_URL=https://testnet.bardock.movementnetwork.xyz/v1
# NEXT_PUBLIC_FAUCET_URL=https://faucet.testnet.bardock.movementnetwork.xyz/

# 自定义 API 配置 (可选 - 用于需要认证的 API 服务)
# NEXT_PUBLIC_WITH_CREDENTIALS=true
# NEXT_PUBLIC_API_KEY=your_api_key_here

# 合约地址配置 - 当前网络的合约部署地址
NEXT_PUBLIC_PACKAGE_ID="0xee653ff802641e554a547e5e0a460dcddd6dfbc603edcb364750f571c2459789"
`;
    await fs.writeFile(envPath, envContent);
    console.log(chalk.green('✅ Created .env file'));

    // Update README.md
    console.log(chalk.yellow('📖 Updating README.md...'));
    const readmePath = path.join(targetDir, 'README.md');
    if (await fs.pathExists(readmePath)) {
      let readmeContent = await fs.readFile(readmePath, 'utf8');
      readmeContent = readmeContent.replace(/{{PROJECT_NAME}}/g, answers.projectName);
      await fs.writeFile(readmePath, readmeContent);
      console.log(chalk.green('✅ Updated README.md'));
    }

    // Update README.en.md
    console.log(chalk.yellow('📖 Updating README.en.md...'));
    const readmeEnPath = path.join(targetDir, 'README.en.md');
    if (await fs.pathExists(readmeEnPath)) {
      let readmeEnContent = await fs.readFile(readmeEnPath, 'utf8');
      readmeEnContent = readmeEnContent.replace(/{{PROJECT_NAME}}/g, answers.projectName);
      await fs.writeFile(readmeEnPath, readmeEnContent);
      console.log(chalk.green('✅ Updated README.en.md'));
    }

    // Success message
    console.log(chalk.green(`\n🎉 Project ${answers.projectName} has been created successfully!`));
    console.log(chalk.blue('\n📋 Next steps:'));
    console.log(chalk.cyan(`   cd ${answers.projectName}`));
    console.log(chalk.cyan('   npm install'));
    console.log(chalk.cyan('   npm run dev'));
    
    console.log(chalk.blue('\n🔗 Your Aptos dApp will be running at http://localhost:3000'));
    console.log(chalk.gray('\n💡 Don\'t forget to update the contract addresses in your .env file after deploying your contracts!'));

  } catch (err) {
    console.error(chalk.red('❌ Error creating project:'), err);
    process.exit(1);
  }
}