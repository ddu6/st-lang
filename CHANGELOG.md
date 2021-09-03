# Change Log
## [0.1.11] - 2021-09-03
### Added
- Stringify command, copy stringify result command and copy id command.

- Completion of orbits.

- Highlight of unquoted katex string.

### Fixed
- Completion, reference and rename of ids of units in children or options.

## [0.1.0] - 2021-09-03
### Changed
- Replace label with id.

### Removed
- Cross file rename of ids.

## [0.0.51] - 2021-09-02
### Added
- Stringify command.

## [0.0.47] - 2021-09-01
### Added
- Partial svg support.

## [0.0.46] - 2021-08-04
### Added
- Keep comments when formatting.

- Cross file completion, reference and rename of labels.

- Hover of labels.

### Changed
- The snippet of heading.

## [0.0.43] - 2021-07-29
### Changed
- Dynamically import katex.

- Change icon.

## [0.0.40] - 2021-07-27
### Changed
- Change the scope name of injection.

- Rewrite the unit compiler of code in st-std.

## [0.0.29] - 2021-07-20
### Fixed
- CSS for `.st-line`, `a` and `.article`.

- Override some default css of vscode in preview.

- Root element of stui.

## [0.0.14] - 2021-07-14
### Fixed
- Highlight for ston.

## [0.0.13] - 2021-07-14
### Fixed
- Reverse corresponding in the case of multi line string.

## [0.0.12] - 2021-07-14
### Added
- Format for urls and ston.

- Reverse line corresponding in preview when double clicking.

### Removed
- Preview for markdown.

## [0.0.9] - 2021-07-14
### Fixed
- Fix stc.

## [0.0.7] - 2021-07-14
### Added
- Much better support of completion, reference and rename of labels.

- Line corresponding in preview when saving.

- Injection to markdown.

- Underline to unquoted label.

### Changed
- Change the language id from st to stdn.

-   Change the type of string in
    ```st
    {mark{'a_n'}}
    ```
    from plain to katex.

- Forbid colon.

- Allow key -.

## [0.0.5] - 2021-06-27
### Added
- Auto reload preview.

## [0.0.4] - 2021-06-27
### Added
- Preview for stdn.

### Removed
- History support.

## [0.0.2] - 2021-06-26
### Added
- Completion, reference and rename of labels.


[0.1.11]: https://github.com/st-org/st-lang/compare/v0.1.0...v0.1.11
[0.1.0]: https://github.com/st-org/st-lang/compare/v0.0.51...v0.1.0
[0.0.51]: https://github.com/st-org/st-lang/compare/v0.0.47...v0.0.51
[0.0.47]: https://github.com/st-org/st-lang/compare/v0.0.46...v0.0.47
[0.0.46]: https://github.com/st-org/st-lang/compare/v0.0.43...v0.0.46
[0.0.43]: https://github.com/st-org/st-lang/compare/v0.0.40...v0.0.43
[0.0.40]: https://github.com/st-org/st-lang/compare/v0.0.29...v0.0.40
[0.0.29]: https://github.com/st-org/st-lang/compare/v0.0.14...v0.0.29
[0.0.14]: https://github.com/st-org/st-lang/compare/v0.0.13...v0.0.14
[0.0.13]: https://github.com/st-org/st-lang/compare/v0.0.12...v0.0.13
[0.0.12]: https://github.com/st-org/st-lang/compare/v0.0.9...v0.0.12
[0.0.9]: https://github.com/st-org/st-lang/compare/v0.0.7...v0.0.9
[0.0.7]: https://github.com/st-org/st-lang/compare/v0.0.5...v0.0.7
[0.0.5]: https://github.com/st-org/st-lang/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/st-org/st-lang/compare/v0.0.2...v0.0.4
[0.0.2]: https://github.com/st-org/st-lang/releases/tag/v0.0.2