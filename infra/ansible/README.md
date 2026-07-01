# Ansible

Two cadences:

- **Prepare** (one-time, run locally, secret-heavy)
- **Deploy** (repetitive, run by CI on a release tag, App VM only, no app secrets)

## First-time setup

```bash
ansible-galaxy install -r requirements.yml
cp secrets.yml.example secrets.yml                           # secrets (gitignored)
cp inventory/hosts.example.yml inventory/hosts.yml          # VM IPs, SSH user, domains (gitignored)
cp group_vars/all/local.example.yml group_vars/all/local.yml # admin_cidrs, registry_owner, certbot_email (gitignored)
```

## One-time bring-up (local)

```bash
ansible-playbook playbooks/prepare.yml         # base setup + hardening (both VMs)
ansible-playbook playbooks/langfuse.yml        # Langfuse stack (Langfuse VM)
ansible-playbook playbooks/app.yml             # app first deploy (App VM)
ansible-playbook playbooks/restore_db.yml -e db_restore_dump_src=/path/to/ctc_seed.dump
ansible-playbook playbooks/prepare.yml --check --diff   # idempotence check
```

## Repetitive deploy (what CI runs)

Triggered automatically by a release tag:

```bash
ansible-playbook playbooks/deploy.yml -e deploy_package=backend -e image_tag=1.2.3
```

**Rollback:** GitHub Actions → **Deploy** → *Run workflow*, pick the package and an older version.
Manual (dispatch) runs skip migrations and only swap the image version.

## Privilege model

- `prepare` / `langfuse` / `restore_db` run as the **admin/bootstrap user** (has sudo) → inventory
  `ansible_user`.
- `deploy.yml` connects as the **`deploy` user** (no sudo). On the App VM `deploy` runs containers
  via **rootful Docker** using the `docker` group.
- The Langfuse VM is rootful/root-managed.

## Secrets

No vault, nothing secret in git. Secrets live only in a gitignored local `secrets.yml`.
