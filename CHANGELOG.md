# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

## [0.1.10] - 2023-11-27

### Fixed

- kenBuddy now also attaches to `orgos-widget-punch-clock` (Thanks [Gustavo Edinger](https://github.com/GustavoEdinger)!)

### Changed

- Added [arrive.js](https://github.com/uzairfarooq/arrive), which now allows to listen for multiple widgets, and also will re-attach the element if you are navigating the page. 

## [0.1.9] - 2023-11-10

### Added

- Start time for lunch break can now be set. The time will be initialized by the start time of the workday + half the duration of the work day.

### Fixed

- The time input got reworked, and now no longer uses the "time" type to input.

## [0.1.8] - 2023-04-03

### Fixed

- Changes to the DST handling introduced an issue where the schedule day was offset by one.

## [0.1.7] - 2023-03-31

### Fixed

- An issue regarding the switch to Daylight Savings Time has been addressed

## [0.1.6] - 2023-03-17

### Fixed

- The `TIMEOFF_URL` endpoint has been removed. For now, the call simply gets skipped, but functionality should be included soon after.

## [0.1.5] - 2023-01-31

### Changed

- Prevents filling the whole week or month in advance.

## [0.1.4] - 2023-01-11

### Added

- Completely new Settings UI
- Ability to fill the attendance for the whole week
- Localization has been completed

### Changed

- Attendance for whole week is now the only visible option. This can be changed in the settings.

### Fixed

- Fixes an issue where the buttons won't appear after logging in

### Maintenance

- Code has been refactored

## [0.1.3] - 2023-01-04

### Added

- Prevents adding another entry on the same day

### Changed

- Renames extensions

## [0.1.2] - 2023-01-03

### Added

- Firefox Support :)
- License.md

### Changed

- Modified the logo
- Extended the Readme

## [0.1.1] - 2023-01-03

### Added

- Changelog :)

### Changed

- [Chrome] Extension now requires less permissions (host_permission)

### Removed

- [Chrome] Alert isn't displayed any longer. The page simply reloads

### Fixed

- [Chrome] Settings are now filled after first launch

## [0.1.0] - 2023-01-02

### Added

- Ability to fill the attendance sheet for a month
- Ability to fill the attendance sheet for a day

[unreleased]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.9...HEAD
[0.1.9]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.1...v0.1.3
[0.1.2]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/DanielGilbert/kenBuddy/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/DanielGilbert/kenBuddy/releases/tag/v0.1.0