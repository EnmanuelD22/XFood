namespace XFood.Infrastructure.Modules.Notifications;

public sealed class ExpiryAlertOptions
{
    public const string SectionName = "Notifications:ExpiryAlerts";
    public int ThresholdMinutes { get; set; } = 120;
}
