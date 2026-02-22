import sys 
import os
from datetime import datetime, date, timedelta
sys.path.append('/app')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
import django 
django.setup()
from certificate.models import Certificate 
from services.mail import send_email

today = date.today() 
warn_date = today + timedelta(days=7)
certificates = Certificate.objects.filter(
    expiration_date__lte=warn_date,
    expiration_date__gte=today
)

if certificates.exists():
    rows = ""
    for certificate in certificates:
        rows += f"""
        <tr>
            <td style="padding:8px; border:1px solid #ddd;">{certificate.name}</td>
            <td style="padding:8px; border:1px solid #ddd;">{certificate.expiration_date.strftime('%Y-%m-%d')}</td>
        </tr>
        """

    mail = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color:#333;">
            <h2 style="color:#d9534f;">🔔 Domain Expiration Warning</h2>
            <p>The following domains are expiring soon:</p>
            <table style="border-collapse: collapse; width:100%; max-width:600px;">
                <thead>
                    <tr style="background-color:#f2f2f2;">
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Domain</th>
                        <th style="padding:8px; border:1px solid #ddd; text-align:left;">Expiration Date</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <br>
            <p style="font-size:12px; color:#999;">
                This is an automated message. Please renew your certificates in time.
            </p>
        </body>
    </html>
    """

    print(mail)
    send_email(body=mail, html=True)
else:
    print("No certificates expiring in the next 7 days.")