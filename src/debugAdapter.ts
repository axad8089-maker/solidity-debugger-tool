import {
    Logger, logger,
    LoggingDebugSession,
    InitializedEvent, TerminatedEvent, StoppedEvent, BreakpointEvent, OutputEvent,
    ProgressStartEvent, ProgressUpdateEvent, ProgressEndEvent,
    Thread, StackFrame, Scope, Source, Handles, Event
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { basename } from 'path';

export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    program: string;
    stopOnEntry?: boolean;
    trace?: boolean;
}

class SolidityDebugSession extends LoggingDebugSession {
    private _variableHandles = new Handles<string>();

    public constructor() {
        super();
        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
        response.body = response.body || {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsEvaluateForHovers = true;
        response.body.supportsStepBack = false;
        this.sendResponse(response);
        // Since this is a placeholder/mock for a real EVM debugger,
        // we just signal initialized immediately.
        this.sendEvent(new InitializedEvent());
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {
        logger.setup(args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop, false);

        // Send an output event to show the debugger is 'running'
        this.sendEvent(new OutputEvent(`[Solidity Debugger Nexus] Starting EVM trace for: ${args.program}\n`, 'console'));

        if (args.stopOnEntry) {
            this.sendEvent(new StoppedEvent('entry', 1));
        }
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        // EVM execution is single threaded
        response.body = {
            threads: [
                new Thread(1, "thread 1")
            ]
        };
        this.sendResponse(response);
    }

    protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {
        const stk = [
            new StackFrame(1, "contract.method()", this.createSource("Contract.sol"), 1, 0)
        ];
        response.body = {
            stackFrames: stk,
            totalFrames: 1
        };
        this.sendResponse(response);
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        response.body = {
            scopes: [
                new Scope("Local", this._variableHandles.create("local"), false),
                new Scope("State", this._variableHandles.create("state"), true)
            ]
        };
        this.sendResponse(response);
    }

    protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments, request?: DebugProtocol.Request): void {
        const variables: DebugProtocol.Variable[] = [];
        const id = this._variableHandles.get(args.variablesReference);

        if (id === 'local') {
            variables.push({
                name: "msg.sender",
                type: "address",
                value: "Mock Sender Address",
                variablesReference: 0
            });
            variables.push({
                name: "msg.value",
                type: "uint256",
                value: "1000000000000000000",
                variablesReference: 0
            });
        }

        response.body = {
            variables: variables
        };
        this.sendResponse(response);
    }

    private createSource(filePath: string): Source {
        return new Source(basename(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'solidity-adapter-data');
    }
}

LoggingDebugSession.run(SolidityDebugSession);
