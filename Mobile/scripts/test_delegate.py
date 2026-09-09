import contextlib
import io
import subprocess
import unittest
from unittest.mock import patch

import delegate


class DelegationTests(unittest.TestCase):
    def run_delegate(self, provider, response=None, error=None):
        with patch("sys.argv", ["delegate.py", provider, "--prompt", "Check only this text"]), \
             patch.object(delegate, "executable", return_value="agent.exe"), \
             patch.object(delegate.subprocess, "run", return_value=response, side_effect=error) as run, \
             contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return delegate.main(), run

    def test_claude_success_restricts_tools(self):
        code, run = self.run_delegate("claude", subprocess.CompletedProcess([], 0, '{"is_error":false}', ''))
        self.assertEqual(code, 0)
        command = run.call_args.args[0]
        self.assertEqual(command[command.index("--tools") + 1], "Read,Glob,Grep")
        self.assertIn("--safe-mode", command)
        self.assertNotIn("--dangerously-skip-permissions", command)

    def test_antigravity_requires_success_status(self):
        code, run = self.run_delegate("antigravity", subprocess.CompletedProcess([], 0, '{"status":"ERROR"}', ''))
        self.assertEqual(code, 1)
        command = run.call_args.args[0]
        self.assertEqual(command[command.index("--mode") + 1], "plan")

    def test_failures_are_not_success(self):
        for error in [FileNotFoundError("missing"), subprocess.TimeoutExpired("agent", 1)]:
            with self.subTest(error=type(error).__name__):
                code, _ = self.run_delegate("claude", error=error)
                self.assertEqual(code, 1)
        for output in ['not json', '{"is_error":true}']:
            code, _ = self.run_delegate("claude", subprocess.CompletedProcess([], 0, output, ''))
            self.assertEqual(code, 1)


if __name__ == "__main__":
    unittest.main()
