# Table Of Contents
- [Table Of Contents](#table-of-contents)
- [3scale DEV](#3scale-dev)
- [Useful links](#useful-links)
  - [Infrastructure](#infrastructure)
  - [Applications](#applications)
- [Cluster and Namespace](#cluster-and-namespace)
- [This Repository](#this-repository)
  - [Manifests](#manifests)
  - [Local Verification](#local-verification)
  - [Continuous Deployment](#continuous-deployment)
- [RDS Database](#rds-database)
  - [RDS Specifics](#rds-specifics)
  - [Connection Details](#connection-details)
  - [How you should use the master credentials?](#how-you-should-use-the-master-credentials)
  - [How to create new user accounts and DB?](#how-to-create-new-user-accounts-and-db)
- [Manage Credentials](#manage-credentials)
  - [Vault Access](#vault-access)
  - [Adding Secrets](#adding-secrets)
  - [Creating External Secrets](#creating-external-secrets)
- [Automatic Deployments](#automatic-deployments)



# 3scale DEV
The 3scale DEV environment is an ArgoCD controlled OpenShift cluster provided by the 3scale
SRE team.  We have been granted an `apicurio` namespace within this cluster so that we can 
deploy DEV versions of our Apicurio applications.

# Useful links

## Infrastructure
  
- [OpenShift Console](https://console-openshift-console.apps.dev-eng-ocp4-mas.dev.3sca.net/)

- [ArgoCd Console](https://gitops.apps.dev-eng-ocp4-mas.dev.3sca.net/applications)

- [Vault](https://vault.apps.dev-eng-ocp4-mas.dev.3sca.net/)

## Applications

- [Keycloak](https://keycloak-rhaf-apicurio.apps.dev-eng-ocp4-mas.dev.3sca.net/)

- [Backstage](https://backstage-rhaf-apicurio.apps.dev-eng-ocp4-mas.dev.3sca.net/)
  
- [Apicurio Registry](https://apicurio-registry-ui-rhaf-apicurio.apps.dev-eng-ocp4-mas.dev.3sca.net/)

- [Apicurio Designer](https://apicurio-designer-ui-rhaf-apicurio.apps.dev-eng-ocp4-mas.dev.3sca.net/)

# Cluster and Namespace

The projects are presently deployed on the 3scale OpenShift Cluster and overseen by the 3Scale 
platform's SRE team. If you encounter any challenges or have inquiries regarding the infrastructure, 
there's the [#list-3scale-sre-mas](https://redhat-internal.slack.com/archives/C0586GTTXH9) Slack channel 
available for you to get in touch with them.

We currently have a single namespace allocated for our use, namely `apicurio` with the resource 
quotas listed below.

``` 
requests.cpu: '4'
requests.memory: 10Gi
services.loadbalancers: '0'
```


> Please note that this is a development cluster equipped with only three OpenShift Container Platform (OCP) worker nodes. Each node has 4 CPUs and 15GB of memory available, serving the needs of OCP, 3Scale and Apicurio components. If additional capacity is required, we can consider a **MODEST INCREASE** in the quota only after optimizing resource requests to match actual usage. However, any adjustments will be made conservatively.

For more details on the cluster and available services, [click here](https://github.com/3scale/platform/blob/master/docs/projects/engineering/dev-ocp-mas.md). 


# This Repository

This repository holds the manifest files that are used for deploying the apicurio projects on the 3scale cluster. 

The project uses [kustomize](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/) and 
[Argo CD](https://argo-cd.readthedocs.io/en/stable/) to enable GitOps and continuous deployments. Hence, any 
changes made to the manifest files will automatically be applied to the project deployments.

## Manifests
The kubernetes/OpenShift manifest files for each project are organized under the `applications` folder.

Each subfolder under the `applications` folder is an application monitored and deployed by ArgoCD.  The 
ArgoCD applications are configured in the [3scale-platform git](https://github.com/3scale/platform/tree/master/manifests/apps/openshift-gitops/overlays/dev-eng-mas/apps) repository.


## Continuous Deployment

This project leverages Argo CD for seamless and automated continuous deployment. Any modifications made to
the manifest files trigger an automatic deployment through these [Argo CD applications](https://gitops.apps.dev-eng-ocp4-mas.dev.3sca.net/applications?showFavorites=false&proj=&sync=&autoSync=&health=&namespace=&cluster=&labels=).

The application is set to synchronize every 5 minutes for regular updates. However, you also have the option 
to manually initiate a synchronization by clicking on the **refresh** button. This ensures that changes are 
promptly reflected in the deployed environment.

**TODO:** As of now, our permissions are limited to read-only access for the Argo applications. Any attempts 
to execute actions are met with denial, stemming from permission constraints. To address this, we could have 
the assignment of the following admin role to our [AppProject](https://github.com/3scale/platform/blob/master/manifests/apps/openshift-gitops/overlays/dev-eng-mas/apps/apicurio-registry/appproject.yaml).

```
roles:
    - name: project-admin
      description: Read/Write access to this project only
      policies:
        - p, proj:apicurio-registry:project-admin, applications, get, apicurio-registry/*, allow
        - p, proj:apicurio-registry:project-admin, applications, create, apicurio-registry/*, allow
        - p, proj:apicurio-registry:project-admin, applications, update, apicurio-registry/*, allow
        - p, proj:apicurio-registry:project-admin, applications, delete, apicurio-registry/*, allow
        - p, proj:apicurio-registry:project-admin, applications, sync, apicurio-registry/*, allow
        - p, proj:apicurio-registry:project-admin, applications, override, apicurio-registry/*, allow
        - p, proj:apicurio-registry:project-admin, applications, action/*, apicurio-registry/*, allow
      groups:
        - rhaf-dev
```

> Note: The ArgoCD deployments are configured and managed by the SRE team in the 3scale platform repository [here](https://github.com/3scale/platform/tree/master/manifests/apps/openshift-gitops)


# RDS Database
The Apicurio 3scale cluster setup leverages a private Amazon RDS (Relational Database Service) instance 
as its primary data storage solution.

## RDS Specifics

- DB Type: PostgreSQL
- DB engine version: 15.4
- Instance Type: db.t4g.small (2 vCPU and 2GB memory)
- Instance Storage: 30 GB

>  Being a development AWS RDS instance, features typically needed for production workloads like MultiAZ, detailed monitoring, long backup retention, etc are not enabled.


## Connection Details

Connections string (master user, master password, RDS host...) can be found at Vault path:

https://vault.apps.dev-eng-ocp4-mas.dev.3sca.net/ui/vault/secrets/secret/show/kubernetes/dev-eng-mas/rhaf-apicurio-registry/dev-eng-mas-apicurio-rds-pgsql-master-credentials


## How you should use the master credentials?

The master username and password should be used exclusively for the creation of individual user accounts, 
associated databases, and the granting of relevant privileges. It is imperative not to utilize them directly 
within your application.

This approach ensures that each application is associated with a dedicated user account, limited to accessing 
a specific database. Consequently, in the unfortunate event of an application compromise, any potential attacker 
would only gain access to the specific database associated with that particular application.

## How to create new user accounts and DB?

To connect to the RDS database, a PostgreSQL client is required. However, you won't be able to connect to the 
RDS instance directly from your laptop, because the RDS is confined to the cluster network's access due to 
security measures in place.

As a solution, a PostgreSQL client (pg-client) has been provisioned within the cluster. You can utilize it to 
establish a connection with the database by following the steps below:

1. **Login to the openshift cluster.**
2. **Exec into the pg-client pod running in the cluster.**
    ```
    oc exec -it pg-client -n apicurio -- /bin/bash
    ```
3. **Connect to the RDS**
    ```
    PGPASSWORD='<password>' psql -h <hostname> -U <user> -d postgres
    ```
4. **Create the new user account and DB.** [*Usually, the database name and the username are kept the same.. The example below illustrates the process of generating a new user and database for the apicurio application. Please make sure to substitute the database name and username according to your specific requirements.*]
    ```
    CREATE USER apicurio WITH PASSWORD '<password>';
    CREATE DATABASE apicurio;
    GRANT ALL PRIVILEGES ON DATABASE apicurio TO apicurio;
    ```

If your application encounters difficulties executing certain database instructions, you may need to
designate the user as the owner of the database using the following command:

    ```
    ALTER DATABASE apicurio OWNER TO apicurio;
    ```

> Note: To confirm the successful creation of the user and database, exit the session and attempt to log in using the newly created user and database credentials.

```
PGPASSWORD='<password>' psql -h <hostname> -U apicurio -d apicurio
```

# Manage Credentials

We employ HashiCorp Vault as a trusted solution for securely managing and storing sensitive information, such
as secrets, credentials, and other confidential data. Vault ensures the highest level of security by providing
a centralized platform for secret management, encryption, and access control. By leveraging Vault's robust 
features and integrations, we can securely store, retrieve, and distribute secrets to our applications and 
services while maintaining strict access controls and audit trails. This approach not only enhances the 
security posture of our deployments but also streamlines the management of secrets, making it an essential 
component of our infrastructure.

## Vault Access

1. Obtain a GitHub personal authentication token by following these steps:
   - Within your GitHub account, access your "Personal settings" by clicking on your profile picture in the upper right corner of the screen and then selecting "settings".

   - Proceed to "Developer settings", followed by "Personal access tokens", and click on "Generate new token". Make sure to grant at least the `read:org` permission.
2. Visit the [Vault Application](https://vault.apps.dev-eng-ocp4-mas.dev.3sca.net/ui/)
3. Authenticate using your GitHub Token.

## Adding Secrets

1. Navigate to `secrets > secret > kubernetes > dev-eng-mas > apicurio`
2. From the WebApplication Secrets page, click Add new secret.
3. Enter secretname in the `Name`` field and secret-value in the Value field, and click Save.


## Creating External Secrets

External Secrets is a Kubernetes extension that enables the integration of external secret management 
systems, such as HashiCorp Vault, with your Kubernetes clusters. By leveraging External Secrets, you 
can centralize the management of secrets in established external systems while benefiting from Kubernetes' 
native secret controller capabilities.

After successfully adding the credentials within the vault, you can proceed to define the ExternalSecret 
Custom Resource. Below is an illustrative YAML example pertaining to the secret named
dev-eng-mas-apicurio-rds-pgsql-apicurio-credentials, which has been incorporated into the vault.

```
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: rds-apicurio-credentials
spec:
  target:
    name: rds-apicurio-credentials
  secretStoreRef:
    kind: ClusterSecretStore
    name: vault-mas  
  refreshInterval: 1m0s
  data:
    - secretKey: database
      remoteRef:
        key: kubernetes/dev-eng-mas/apicurio/dev-eng-mas-apicurio-rds-pgsql-apicurio-credentials
        property: database
    - secretKey: host
      remoteRef:
        key: kubernetes/dev-eng-mas/apicurio/dev-eng-mas-apicurio-rds-pgsql-apicurio-credentials
        property: host
    - secretKey: port
      remoteRef:
        key: kubernetes/dev-eng-mas/apicurio/dev-eng-mas-apicurio-rds-pgsql-apicurio-credentials
        property: port
    - secretKey: user
      remoteRef:
        key: kubernetes/dev-eng-mas/apicurio/dev-eng-mas-apicurio-rds-pgsql-apicurio-credentials
        property: user
    - secretKey: password
      remoteRef:
        key: kubernetes/dev-eng-mas/apicurio/dev-eng-mas-apicurio-rds-pgsql-apicurio-credentials
        property: password
```

# Automatic Deployments

The Registry and Designer applications are each configured to automatically deploy the latest snapshot
version whenever that version is built.  This is accomplished through GitHub workflows configured in
the following locations:

* [apicurio-registry/.github/workflows/verify.yaml](https://github.com/Apicurio/apicurio-registry/blob/main/.github/workflows/verify.yaml)
* [apicurio-api-designer/.github/workflows/verify.yaml](https://github.com/Apicurio/apicurio-api-designer/blob/main/.github/workflows/verify.yaml)
* [apicurio-3scale-gitops/.github/workflows/deploy_latest_registry.yml](https://github.com/Apicurio/apicurio-3scale-gitops/blob/main/.github/workflows/deploy_latest_registry.yml)
* [apicurio-3scale-gitops/.github/workflows/deploy_latest_designer.yml](https://github.com/Apicurio/apicurio-3scale-gitops/blob/main/.github/workflows/deploy_latest_designer.yml)

Whenever a change is made to `main` for either apicurio-registry or apicurio-api-designer, the
standard Verify workflow is run.  That workflow builds and tests the software, and then it
builds and pushes docker containers tagged with `latest-snapshot`.  Each of those workflows
has a job called `trigger-3scale-deploy` which will trigger the appropriate `deploy_latest_*.yaml`
workflow from the 3scale gitops repo.

When triggered, the `deploy_latest_*.yaml` perform the following steps:

1. `docker pull` on the appropriate images tagged by `latest-snapshot`
2. `docker inspect` on the images to determine their SHA/digest
3. Update the appropriate deployment yaml config with the new SHA/digest for the image
4. Push changes to the repo

This will then cause ArgoCD to redeploy the application with the new docker image.

