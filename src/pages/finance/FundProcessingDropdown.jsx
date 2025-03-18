import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import { MoreVertical } from 'lucide-react';

const FundProcessingDropdown = ({ fund, onProcessing, onPaid }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleProcessingClick = async () => {
    if (!['PAID', 'DECLINED', 'PROCESSING'].includes(fund.status)) {
      await onProcessing(fund.reference, 'processing');
      setIsOpen(false);
    }
  };

  const handlePaidClick = async () => {
    if (!['PAID', 'DECLINED'].includes(fund.status)) {
      await onPaid(fund.reference, 'paid');
      setIsOpen(false);
    }
  };

  const handleDeclineClick = () => {
    if (!['PAID', 'DECLINED'].includes(fund.status)) {
      handleFundProcessing(fund.reference, 'decline');
    }
  };

  const isProcessingDisabled = ['PAID', 'DECLINED', 'PROCESSING'].includes(fund.status);
  const isPaidDisabled = ['PAID', 'DECLINED'].includes(fund.status);
  const isDeclineDisabled = ['PAID', 'DECLINED'].includes(fund.status);

  return (
    <DropdownMenu 
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="ghost" size="sm" className="p-2">
          <MoreVertical className="h-4 w-4" />
        </Button>
      }
    >
    <DropdownItem 
            onClick={handleDeclineClick}
            disabled={isDeclineDisabled}
            className={`${
              isDeclineDisabled 
                ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Decline
          </DropdownItem>
          
      <DropdownItem 
        onClick={handleProcessingClick}
        disabled={isProcessingDisabled}
        className={`${
          isProcessingDisabled 
            ? 'opacity-50 cursor-not-allowed pointer-events-none' 
            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Move to Processing
      </DropdownItem>
      <DropdownItem 
        onClick={handlePaidClick}
        disabled={isPaidDisabled}
        className={`${
          isPaidDisabled
            ? 'opacity-50 cursor-not-allowed pointer-events-none' 
            : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        Move to Paid
      </DropdownItem>
    </DropdownMenu>
  );
};

export default FundProcessingDropdown;