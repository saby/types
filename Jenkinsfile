@Library('pipeline') _

def version = '21.5000'

node ('controls') {
    checkout_pipeline("21.4000/bugfix/test-unit-core-branch")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('types', version)
}