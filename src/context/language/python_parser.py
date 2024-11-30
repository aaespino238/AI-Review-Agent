import ast
import sys
import json

def node_to_enclosing_context(node):
    """
    Converts a Python AST to enclosing context object.
    """

    enclosing_context = {
        "line_start": node.lineno,
        "line_end": node.end_lineno
    }

    return enclosing_context

class PythonParser:
    def __init__(self):
        self.largest_size = 0
        self.largest_enclosing_context = None
        self.start = None
        self.end = None

    def process_node(self, node, line_start, line_end):
        """
        Process a node and check if it encloses the specified line range.
        """
        # Check if the node has location attributes
        print(line_start, line_end)

        start_line = node.lineno
        end_line = getattr(node, "end_lineno", start_line)
        
        # print(start_line, end_line)
        # print(self.start, self.end)
        # print("\n")

        # find first occurence of a node that contains any amount of [line_start, line_end]
        if not self.start and start_line <= line_start and end_line >= line_start:
            self.start = start_line
        
        # find node containing any amount of [line_start, line_end] that maximizes enclosing context size
        if self.start and start_line <= line_end:
            if end_line - self.start > self.largest_size:
                self.end = end_line
                self.largest_size = end_line-self.start

        # if start_line <= line_start and line_end <= end_line:
        #     size = end_line - start_line
        #     if size > self.largest_size:
        #         self.largest_size = size
        #         self.start = start_line
        #         self.end = end_line

    def find_enclosing_context(self, file_content, line_start, line_end):
        """
        Finds the largest enclosing context for a given line range.
        """
        # Parse the file content into an AST
        tree = ast.parse(file_content)

        # Traverse the AST and process nodes
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef)):  # Add other types if needed
                self.process_node(node, line_start, line_end)

        # Return the largest enclosing context as a dictionary for simplicity
        if self.start and self.end:
            return {
                "line_start": self.start,
                "line_end": self.end
            }
        else:
            return None

    def dry_run(self, file_content):
        """
        Validates whether the Python code is syntactically correct.
        """
        try:
            ast.parse(file_content)
            return {"valid": True, "error": ""}
        except SyntaxError as e:
            return {"valid": False, "error": str(e)}

if __name__=="__main__":
    try:
        parser = PythonParser()
        file_content = sys.argv[1]
        job = sys.argv[2]

        if job == "dry_run":
            output = parser.dry_run(file_content)
            print(json.dumps(output))
        elif job == "enclosing_context":
            line_start = int(sys.argv[3])
            line_end = int(sys.argv[4])
            output = parser.find_enclosing_context(file_content, line_start, line_end)
            print(json.dumps(output))
        else:
            print(json.dumps({"Unknown job"}))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "argv": sys.argv
        }))
        
        sys.exit(1)