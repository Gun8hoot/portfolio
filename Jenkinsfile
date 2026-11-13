pipeline {
  agent any
  options { disableConcurrentBuilds(); timeout(time: 15, unit: 'MINUTES') }
  triggers { githubPush() }
  environment {
    HOST = 'web@host.docker.internal'   // use your web user's name
    SSH_OPTS = '-o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/var/jenkins_home/.ssh/known_hosts'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script { env.SHA = sh(returnStdout: true, script: 'git rev-parse HEAD').trim() }
      }
    }
    stage('Build & push image') {
      steps {
        sshagent(['host-deploy-key']) {
          sh 'git archive --format=tar HEAD | ssh $SSH_OPTS $HOST "build $SHA"'
        }
      }
    }
    stage('Deploy') {
      steps {
        sshagent(['host-deploy-key']) {
          sh 'ssh $SSH_OPTS $HOST "deploy $SHA"'
        }
      }
    }
  }
  post { failure { echo 'Pipeline failed, check /var/log/infra/ci.log on the host' } }
}
