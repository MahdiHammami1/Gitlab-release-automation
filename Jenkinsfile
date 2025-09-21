pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "registry.gitlab.com/mahdihm140/gitlab-release-automation/backend"

        // Variables simples
        GITLAB_API = "https://gitlab.com/api/v4"
        NODE_ENV = "development"
        PORT = "3000"
        ALLOW_INSECURE_SSL = "false"

        // Variables sécurisées depuis Jenkins Credentials
        GITLAB_PAT = credentials('gitlab-pat')       // 🔒 PAT GitLab stocké dans Jenkins
        DATABASE_URL = credentials('mongo-url')      // 🔒 MongoDB URL stockée dans Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                sh '''
                  rm -rf repo
                  git clone -b mahdi https://github.com/MahdiHammami1/Gitlab-release-automation.git repo
                '''
            }
        }

        stage('Build Backend') {
            agent {
                docker { image 'node:20' }
            }
            steps {
                dir('repo') {
                    sh '''
                      npm config set cache /var/jenkins_home/.npm-cache --global
                      npm install
                      npx prisma generate --schema=src/prisma/schema.prisma
                      npm run build
                    '''
                }
            }
        }


    }
}
