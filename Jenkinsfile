pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "registry.gitlab.com/mahdihm140/gitlab-release-automation/backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'mahdi', url: 'https://github.com/MahdiHammami1/Gitlab-automation-release-back.git'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Docker Build & Push Backend') {
            steps {
                script {
                    docker.withRegistry('https://registry.gitlab.com') {
                        // Tag avec le numéro de build Jenkins
                        docker.build("${BACKEND_IMAGE}:${env.BUILD_NUMBER}")
                              .push()
                        // Tag "latest" pour toujours avoir la version la plus récente
                        docker.build("${BACKEND_IMAGE}:latest")
                              .push()
                    }
                }
            }
        }
    }
}
