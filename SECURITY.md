# SECURITY

## Security Policy

We take the security of FormFx seriously.

### Safe Expression Evaluation

FormFx uses a custom-built tokenizer, parser, and evaluator. It **does not use `eval()` or `new Function()`**. This prevents common XSS vulnerabilities related to dynamic expression evaluation. All expressions are evaluated in a sandbox against a provided context.

### Reporting a Vulnerability

If you discover a security vulnerability within FormFx, please send an e-mail to security@example.com. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:

- Type of issue (e.g., XSS, sandbox escape)
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

We will acknowledge receipt of your report within 48 hours and provide a timeline for a fix.
