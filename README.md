# kaholo-trigger-prometheus
Simple trigger for prometheus webhooks integration with Kaholo.

## How to use:
After installing the trigger on Kaholo, make sure to follow all the steps below:

* Make sure you have alert rules configured on your Prometheus server. You can see more info on alert rules [here](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)

* **Install and configure Prometheus's AlertManager:** 
Please make sure to include the following code(also included in this project files as alertManager.yml) in your AlertManager config file:
```yaml
route:
  receiver: 'Kaholo'
  group_by: [alertname]
receivers:
  - name: 'Kaholo'
    webhook_configs:
    - url: {KAHOLO_URL}/webhook/prometheus
```
and change the KAHOLO_URL placeholder to your Kaholo Server's URL.
You can see more on downloading and installing the AlertManager[here](https://github.com/prometheus/alertmanager).
You can see more on configuring your AlertManager [here](https:/prometheus.io/docs/alerting/latest/configuration/).

* **Configure Prometheus server to talk with AlertManager:**
In case you just added AlertManager, this step is necessary.
Add the following code to your Prometheus server configuration:
```yaml
alerting:
  alertmanagers:
    - static_configs:
      - targets: ["alertmanager:9093"]
```
You can see more on Prometheus Configuration file [here](https://prometheus.io/docs/prometheus/latest/configuration/configuration/).

## Method: Alert
Triggers whenever there is a post request sent from Prometheus.

### Webhook URL:
**{KAHOLO_URL}/webhook/prometheus**

### Parameters:
1. Alert Name (String) **Optional** - Alert name or it's [minimatch pattern](https://github.com/isaacs/minimatch#readme). If not specified accept any.
2. Group Key (String) **Optional** - Group key or it's [minimatch pattern](https://github.com/isaacs/minimatch#readme). If not specified accept any.
3. Status (Options) **Optional** - Whether to accept firing\resolved alerts or both of them. default is both.
4. Labels (Text) **Optional** - If specified, incoming alert labels must contains all labels specified. Each label needs to be in the format of key=value. You can enter multiple labels by seperating each label with a new line.