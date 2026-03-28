# Solidity Debugger Nexus

A debugging tool for Visual Studio Code.

## Features

- Variable inspection and transaction insights.
- Breakpoints and execution stepping integrations.
- Built for the Debug Adapter Protocol.

## Requirements

- Visual Studio Code version 1.80.0 or higher.
- Node.js runtime.

## Installation

1. Launch Visual Studio Code.
2. Navigate to the Extensions sidebar.
3. Search for Solidity Debugger Nexus.
4. Click Install.

## Configuration

Configure your debug parameters in `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "solidity",
      "request": "launch",
      "name": "Debug Contract",
      "program": "${workspaceFolder}/src/Contract.sol",
      "stopOnEntry": true,
      "trace": false
    }
  ]
}
```

## Version History

- **v1.0.3**: Initial core architecture setup.

## License

This project is licensed under the MIT License.
