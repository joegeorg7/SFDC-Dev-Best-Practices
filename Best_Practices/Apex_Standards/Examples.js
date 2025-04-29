
// 1. Governor Limits Management 
// Added a new line
// Example: Updating task statuses in bulk to avoid governor limit issues.
List<Task__c> tasks = [SELECT Id, Status__c FROM Task__c WHERE Status__c = 'In Progress'];
for (Task__c task : tasks) {
    task.Status__c = 'Completed';
}
update tasks;  // Perform a single DML outside the loop

// 2. Bulkification
// Example: Bulk-assign team members to tasks to efficiently handle large datasets.
public void assignTeamMembersToTasks(List<Task__c> taskList, List<TeamMember__c> members) {
    List<TaskAssignment__c> assignments = new List<TaskAssignment__c>();
    for (Task__c task : taskList) {
        for (TeamMember__c member : members) {
            TaskAssignment__c assignment = new TaskAssignment__c();
            assignment.Task__c = task.Id;
            assignment.TeamMember__c = member.Id;
            assignments.add(assignment);
        }
    }
    insert assignments;
}

// 3. Efficient SOQL and DML Practices
// Example: Efficiently retrieving related tasks when calculating project progress.
List<Project__c> projects = [SELECT Id, (SELECT Id, Status__c FROM Tasks__r WHERE Status__c = 'Completed') FROM Project__c WHERE Status__c != 'Completed'];
for (Project__c project : projects) {
    // Process completed tasks related to each project to update progress
}

// 4. Security and Data Access Control
// Example: Enforcing FLS to ensure sensitive fields are only updated if the user has permission.
if (Schema.sObjectType.Task__c.fields.SensitiveField__c.isUpdateable()) {
    Task__c task = [SELECT Id, SensitiveField__c FROM Task__c WHERE Id = :taskId LIMIT 1];
    task.SensitiveField__c = 'New Value';
    update task;
} else {
    // Handle lack of permission
}

// 5. Asynchronous Apex Usage (Future, Queueable, Batch, Scheduled)
// Example: Using Queueable Apex for overdue task notifications.
public class OverdueTaskNotifier implements Queueable {
    public void execute(QueueableContext context) {
        List<Task__c> overdueTasks = [SELECT Id, Status__c, DueDate__c FROM Task__c WHERE DueDate__c < TODAY AND Status__c != 'Completed'];
        for (Task__c task : overdueTasks) {
            task.Status__c = 'Overdue';
        }
        update overdueTasks;
    }
}
// To enqueue the job
System.enqueueJob(new OverdueTaskNotifier());

// 6. Testing and Code Coverage
// Example: Testing task assignment functionality with both positive and negative cases.
@isTest
public class TaskAssignmentTest {
    @isTest static void testBulkTaskAssignment() {
        List<Task__c> tasks = new List<Task__c>();
        for (Integer i = 0; i < 200; i++) {
            tasks.add(new Task__c(Name='Task' + i, Status__c='New'));
        }
        insert tasks;

        Test.startTest();
        ProjectService.assignTeamMembersToTasks(tasks, [SELECT Id FROM TeamMember__c]);
        Test.stopTest();

        // Verify assignments were created for each task
    }

    @isTest static void testInvalidTaskAssignment() {
        // Negative test case: Attempt assignment with invalid data and verify handling
    }
}

// 7. Trigger Frameworks and Handler Classes
// Example: Trigger and handler pattern for managing task updates.
trigger TaskTrigger on Task__c (before insert, before update, after insert) {
    TaskHandler.handleTrigger(Trigger.new, Trigger.oldMap);
}

// Handler class for Task__c
public class TaskHandler {
    public static void handleTrigger(List<Task__c> newTasks, Map<Id, Task__c> oldTasks) {
        for (Task__c task : newTasks) {
            if (task.Status__c == 'Completed') {
                // Update related project progress if the task is completed
            }
        }
    }
}

// 8. Using Custom Metadata and Custom Settings
// Example: Using custom metadata to configure priority threshold for projects.
public class ProjectService {
    public void evaluateProjectPriority(Project__c project) {
        Integer highPriorityThreshold = ProjectPrioritySetting__mdt.getInstance('Default').Threshold__c;
        if (project.TaskCount__c >= highPriorityThreshold) {
            project.Priority__c = 'High';
        }
    }
}

// 9. Avoiding Recursive Triggers
// Example: Using static variables to prevent recursive trigger calls.
public class TaskTriggerHandler {
    public static Boolean isRecursive = false;
    
    public static void handleTaskUpdate(List<Task__c> tasks) {
        if (!isRecursive) {
            isRecursive = true;
            for (Task__c task : tasks) {
                task.Status__c = 'Processed';
            }
            update tasks;
            isRecursive = false;
        }
    }
}

// 10. Performance Monitoring and Optimization
// Example: Using a map for optimized lookup while processing projects.
Map<Id, Project__c> projectMap = new Map<Id, Project__c>([SELECT Id, Name FROM Project__c WHERE Status__c != 'Completed']);
for (Project__c project : projectMap.values()) {
    // Process project data for task assignment
}

// 11. Using Limits Class for Resource Management
// Example: Tracking SOQL queries with Limits class to avoid governor limits.
if (Limits.getQueries() < Limits.getLimitQueries()) {
    List<Task__c> tasks = [SELECT Id, Status__c FROM Task__c WHERE Status__c = 'Open'];
    for (Task__c task : tasks) {
        // Process each task
    }
} else {
    System.debug('Query limit reached');
}


// Try-Catch Block Example
public with sharing class ExampleClass {
  public static void updateAccount(String accountId) {
    try {
      Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
      update acc;
    } catch(Exception e) {
      System.debug('Error: ' + e.getMessage());
    }
  }
}

// Specific Exception Handling Example
public with sharing class ExampleClass {
  public static void updateAccount(String accountId) {
    try {
      Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
      update acc;
    } catch(DmlException e) {
      System.debug('DML Error: ' + e.getMessage());
    } catch(QueryException e) {
      System.debug('Query Error: ' + e.getMessage());
    }
  }
}

// Custom Exception Example
public with sharing class ExampleClass {
  public class MyCustomException extends Exception {}

  public static void updateAccount(String accountId) {
    try {
      Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
      update acc;
    } catch(Exception e) {
      throw new MyCustomException('Custom Error: ' + e.getMessage());
    }
  }
}

// AuraHandledException Example
public with sharing class ExampleClass {
  @AuraEnabled
  public static void updateAccount(String accountId) {
    try {
      Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
      update acc;
    } catch(Exception e) {
      throw new AuraHandledException('Failed to update the account.');
    }
  }
}

// Custom Exception Class Example
public with sharing class ExampleClass {
  public class MyCustomException extends Exception {}

  @AuraEnabled
  public static void updateAccount(String accountId) {
    try {
      Account acc = [SELECT Id FROM Account WHERE Id = :accountId LIMIT 1];
      update acc;
    } catch(Exception e) {
      throw new MyCustomException('Custom Error: ' + e.getMessage());
    }
  }
}

// Null Handling Example
public with sharing class ExampleClass {
  @AuraEnabled
  public static String handleNullValue(String input) {
    return input?.toUpperCase();
  }
}

// Custom Error Object Example
public class ErrorWrapper {
  public String severity;
  public String message;

  public ErrorWrapper(String severity, String message) {
    this.severity = severity;
    this.message = message;
  }
}
