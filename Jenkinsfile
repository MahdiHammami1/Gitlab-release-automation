pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "registry.gitlab.com/mahdihm140/gitlab-release-automation/backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'mahdi',
                    url: 'https://github.com/MahdiHammami1/Gitlab-release-automation.git'
            }
        }

        stage('Build Backend') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Docker Build & Push Backend') {
            steps {
                script {
                    docker.withRegistry('https://registry.gitlab.com', 'gitlab-docker-creds') {
                        docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}").push()
                        docker.build("${BACKEND_IMAGE}:latest").push()
                    }
                }
            }
        }
    }
}
