
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WebhookFields } from "@/types/webhook";

interface WebhookFieldsSelectorProps {
  fields: WebhookFields;
  onFieldChange: (field: keyof WebhookFields, value: boolean) => void;
}

export const WebhookFieldsSelector: React.FC<WebhookFieldsSelectorProps> = ({
  fields,
  onFieldChange,
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-base">Data Fields to Include</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="user_data"
            checked={fields.user_data} 
            onCheckedChange={(checked) => onFieldChange('user_data', checked === true)}
          />
          <Label htmlFor="user_data">User Data</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="weight_data"
            checked={fields.weight_data} 
            onCheckedChange={(checked) => onFieldChange('weight_data', checked === true)}
          />
          <Label htmlFor="weight_data">Weight Data</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="goal_data"
            checked={fields.goal_data} 
            onCheckedChange={(checked) => onFieldChange('goal_data', checked === true)}
          />
          <Label htmlFor="goal_data">Goal Data</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="activity_data"
            checked={fields.activity_data} 
            onCheckedChange={(checked) => onFieldChange('activity_data', checked === true)}
          />
          <Label htmlFor="activity_data">Activity Data</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="detailed_analysis"
            checked={fields.detailed_analysis} 
            onCheckedChange={(checked) => onFieldChange('detailed_analysis', checked === true)}
          />
          <Label htmlFor="detailed_analysis">Detailed Analysis</Label>
        </div>
      </div>
    </div>
  );
};
