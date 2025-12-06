# Contributing to ExB-Simple

Thank you for your interest in contributing to ExB-Simple! This document outlines our branching strategy and contribution process.

## Branching Strategy

We use a `main`/`develop` branching strategy to maintain code quality and ensure stable releases.

### Branches

| Branch | Purpose | Content State | Workflow |
| :--- | :--- | :--- | :--- |
| **main** | **Public Production / Shared Code** | Only stable, tested code ready for public use. | **Protected.** Only merges from `develop` are permitted via **Pull Requests (PRs)**. |
| **develop** | **Integration / Staging** | Contains the latest features, bug fixes, and active work. | **Active Work.** All feature branches merge here first. |

### Feature Branches

Feature branches are created from `develop` and follow the naming convention:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates

Examples:
- `feature/add-new-widget`
- `fix/hash-parameter-bug`
- `docs/update-installation-guide`

## Contribution Workflow

### 1. Create a Feature Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the patterns in [DEVELOPMENT_GUIDE.md](./client/your-extensions/widgets/DEVELOPMENT_GUIDE.md)
- Add tests when appropriate
- Update documentation as needed

### 3. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "Add feature: Description of what you added"
git commit -m "Fix bug: Description of what you fixed"
```

### 4. Push and Create Pull Request

```bash
# Push your branch
git push -u origin feature/your-feature-name
```

Then create a Pull Request on GitHub:
- **Source:** Your feature branch
- **Target:** `develop` branch
- **Title:** Clear description of changes
- **Description:** 
  - What changed and why
  - How to test
  - Related issues (if any)

### 5. Code Review

- All PRs require review before merging
- Address review feedback promptly
- Update PR description if changes are made

### 6. Merge to Develop

Once approved, your PR will be merged to `develop`.

### 7. Release to Main

When `develop` is stable and ready for production:
- Create PR from `develop` to `main`
- Review and merge
- Tag release if needed

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use consistent formatting (ESLint/Prettier)
- Follow React patterns used in Experience Builder
- Document complex logic

### Testing

- Add unit tests for new functionality
- Add E2E tests for user-facing features
- Ensure all tests pass before submitting PR

### Documentation

- Update README.md if adding new features
- Update DEVELOPMENT_GUIDE.md for new patterns
- Add inline comments for complex code
- Update widget-specific docs in `widgets/README.md`

### Widget Development

See [DEVELOPMENT_GUIDE.md](./client/your-extensions/widgets/DEVELOPMENT_GUIDE.md) for:
- Widget architecture patterns
- Shared code usage
- Data source management
- Error handling
- Testing strategies

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] PR description is complete
- [ ] No console errors or warnings
- [ ] Widgets work in Experience Builder

## Questions?

- Check [DEVELOPMENT_GUIDE.md](./client/your-extensions/widgets/DEVELOPMENT_GUIDE.md)
- Open an issue for questions
- Review existing PRs for examples

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

