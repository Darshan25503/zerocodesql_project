APIs
- [ ] Refresh API Token - if private
- [ ] Ability to change public/private access, generate token if set to private
- [ ] Add the API token display
- [ ] Ability to Enable/Disable APIs

Security:
- [ ] Make all APIs validate input and access control
- [ ] There is literally no OTP security for the /otpsignin route. Anybody can just send a POST request to it with the email to sign into that account
- [ ] Handle paths in protected routes better for Authenticator