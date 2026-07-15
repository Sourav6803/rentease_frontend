// styles/vendorDashboard.styles.ts
import styled from 'styled-components';
import { Card } from 'antd';

export const StyledCard = styled(Card)<{ $gradient?: string }>`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  height: 100%;
  ${props => props.$gradient && `
    background: linear-gradient(135deg, ${props.$gradient});
    color: white;
    
    .ant-statistic-title {
      color: rgba(255, 255, 255, 0.85);
    }
    
    .ant-statistic-content {
      color: white;
    }
    
    .ant-typography {
      color: rgba(255, 255, 255, 0.85);
    }
  `}
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .ant-statistic-title {
    font-size: 14px;
    font-weight: 500;
  }
  
  .ant-statistic-content {
    font-size: 28px;
    font-weight: 600;
  }
`;

export const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ChartContainer = styled.div`
  height: 400px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

export const KPIWrapper = styled.div`
  position: relative;
  padding: 8px 0;
`;

export const ActivityItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #fafafa;
    transform: translateX(4px);
  }
`;

export const CustomerItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #fafafa;
  }
`;