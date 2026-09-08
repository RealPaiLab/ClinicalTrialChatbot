# Ansible

Two cadences:

- **Prepare** (one-time, run locally, secret-heavy)
- **Deploy** (repetitive, run by CI on a release tag, no app secrets)

Two deployed environments, both driven by the same roles:

| | production | staging |
|---|---|---|
| Group / target | `production` (default) | `staging` (`-e deploy_target=staging`) |
| VM | App VM | Langfuse VM (co-hosted) |
| Directory | `/opt/ctc/app` | `/opt/ctc/staging` |
| Compose project | `app` | `staging` |
| `deploy_slot` | `app` (kept: production is already deployed there) | `staging` |
| Host ports (127.0.0.1) | 5432 / 6379 / 8000 / 8080 | 5433 / 6380 / 8001 / 8081 |
| Edge | nginx + TLS (dehydrated cert) | nginx + TLS (own dehydrated cert), separate site |
| `ENVIRONMENT` | `production` | `staging` (adds `/debug`, API docs, free-text feedback, trace content; no Turnstile) |
| Image tag | semver from a release tag | `staging` / `staging-<short-sha>` |

Shared variables live in `inventory/group_vars/common.yml`; each environment overrides only what
differs in `group_vars/production.yml` and `group_vars/staging.yml`.

## First-time setup

```bash
ansible-galaxy install -r requirements.yml
cp secrets.yml.example secrets.yml                           # secrets (gitignored)
cp inventory/hosts.example.yml inventory/hosts.yml          # VM IPs, SSH user, domains (gitignored)
cp inventory/group_vars/all/local.example.yml inventory/group_vars/all/local.yml # admin_cidrs, registry_owner (gitignored)
```

## One-time bring-up (local)

```bash
ansible-playbook playbooks/prepare.yml         # base setup + nginx (all VMs)
ansible-playbook playbooks/langfuse.yml        # Langfuse stack (Langfuse VM)
ansible-playbook playbooks/app.yml             # app first deploy (App VM)
ansible-playbook playbooks/restore_db.yml -e db_restore_dump_src=/path/to/ctc_seed.dump
ansible-playbook playbooks/prepare.yml --check --diff   # idempotence check
```

Staging is the same three commands with `-e deploy_target=staging`:

```bash
ansible-playbook playbooks/app.yml -e deploy_target=staging
ansible-playbook playbooks/restore_db.yml -e deploy_target=staging \
  -e db_restore_dump_src=/path/to/ctc_seed.dump
```

## Repetitive deploy (what CI runs)

Triggered automatically by a release tag:

```bash
ansible-playbook playbooks/deploy.yml -e deploy_package=backend -e image_tag=1.2.3
```

Staging is deployed by hand from a laptop, against an image the `staging` branch published:

```bash
ansible-playbook playbooks/deploy.yml -e deploy_target=staging \
  -e deploy_package=backend -e image_tag=staging-a1b2c3d
```

**Rollback:** GitHub Actions → **Deploy** → *Run workflow*, pick the package and an older version.
Manual (dispatch) runs skip migrations and only swap the image version.

## Privilege model

- `prepare` / `langfuse` / `restore_db` run as the **admin/bootstrap user** (has sudo) → inventory
  `ansible_user`.
- `deploy.yml` connects as the **`deploy` user** (no sudo). It runs containers via **rootful
  Docker** using the `docker` group, on both the App VM and the staging host.
- The Langfuse VM is rootful/root-managed. Because staging is co-hosted there, `deploy` is in that
  machine's `docker` group and can therefore reach the Langfuse containers too: docker group
  membership is effectively root. Accepted for the PoC; revisit before public exposure.

## Secrets

No vault, nothing secret in git. Secrets live only in a gitignored local `secrets.yml`.

`secrets.yml` is loaded with `vars_files`, which outranks `group_vars`, so a per-environment
secret cannot simply be overridden in `group_vars/staging.yml`. Instead each environment group
defines an `app_secrets` mapping that picks which flat secret name it reads: production reads
`app_postgres_password` and `turnstile_*`, staging reads `staging_app_postgres_password` and
hardcodes empty Turnstile keys (the bot gate is production-only in code, so staging is never sent
them). Add a new per-environment secret in both places.

## Scheduled ingestion

The corpus refresh runs from a systemd timer installed by the `ingestion` role. It is part of

```bash
# install / update the schedule (unit name is <project>-<slot>-ingestion)
ansible-playbook playbooks/app.yml                          # production
ansible-playbook playbooks/app.yml -e deploy_target=staging # staging

# on the VM
systemctl list-timers ctc-app-ingestion.timer          # when it next fires
journalctl -u ctc-app-ingestion.service -n 200         # what the last run did
sudo systemctl start ctc-app-ingestion.service         # force a run now
```

Turn it off for an environment with `ingestion_enabled: false` in its group_vars and re-run
`app.yml`; the role stops the timer and removes the units.
