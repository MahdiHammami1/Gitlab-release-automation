pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "registry.gitlab.com/mahdihm140/gitlab-release-automation/backend"
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
                docker { image 'node:20-alpine' }
            }
            steps {
                dir('repo') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build & Push Backend') {
            steps {
                script {
                    docker.withRegistry('https://registry.gitlab.com', 'gitlab-docker-creds') {
                        docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}", "repo").push()
                        docker.build("${BACKEND_IMAGE}:latest", "repo").push()
                    }
                }
            }
        }
    }
}
