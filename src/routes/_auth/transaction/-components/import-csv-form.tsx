import { useState } from "react";
import { Modal, Steps, Upload, message, Table, Button, Typography, Space, Row, Col, Card, Statistic, Result, Tag, Progress, Spin } from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  FileExcelOutlined, 
  InfoCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import Papa, { type ParseResult } from "papaparse";
import axios from "axios";
import { useAxios } from "#/hooks/useAxios";

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

interface ImportCSVFormProps {
  open: boolean;
  onClose: () => void;
}

interface CSVRow {
  description?: string;
  amount?: string;
  category?: string;
  occurredAt?: string;
  [key: string]: any;
}

interface ParsedTransaction {
  key: number;
  description: string;
  amount: number;
  category: string;
  occurredAt: Date | null;
  isValid: boolean;
  errors: string[];
  raw: CSVRow;
}

const REQUIRED_HEADERS = ["description", "amount", "category", "occurredAt"];

export default function ImportCSVForm({ open, onClose }: ImportCSVFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedTransaction[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const api = useAxios();

  const resetForm = () => {
    setCurrentStep(0);
    setParsedData([]);
    setHeaders([]);
    setIsImporting(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setAbortController(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateRow = (row: CSVRow, index: number): ParsedTransaction => {
    const errors: string[] = [];
    
    let amountNum = 0;
    if (!row.amount || typeof row.amount !== 'string' || row.amount.trim() === '') {
      errors.push("Missing amount");
    } else {
      amountNum = parseFloat(row.amount);
      if (isNaN(amountNum)) {
        errors.push("Invalid amount (must be a number)");
      }

      if (amountNum < 0) {
        errors.push("Amount cannot be negative");
      }
    }

    let date = null;
    if (!row.occurredAt || typeof row.occurredAt !== 'string' || row.occurredAt.trim() === '') {
      errors.push("Missing occurredAt");
    } else {
      date = new Date(row.occurredAt);
      if (isNaN(date.getTime())) {
        errors.push("Invalid occurredAt (must be a valid date)");
      }
    }

    if (!row.description || typeof row.description !== 'string' || row.description.trim() === '') {
      errors.push("Missing description");
    }

    if (!row.category || typeof row.category !== 'string' || row.category.trim() === '') {
      errors.push("Missing category");
    }


    return {
      key: index,
      description: row.description || "",
      amount: amountNum,
      category: row.category || "",
      occurredAt: date,
      isValid: errors.length === 0,
      errors,
      raw: row,
    };
  };

  const handleFileUpload = (file: File) => {
    const isCsv = file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.name.endsWith(".csv");
    if (!isCsv) {
      message.error("You can only upload CSV files!");
      return Upload.LIST_IGNORE;
    }

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CSVRow>) => {
        if (results.meta.fields) {
          const fileHeaders = results.meta.fields;
          
          const missingHeaders = REQUIRED_HEADERS.filter(h => !fileHeaders.includes(h));
          if (missingHeaders.length > 0) {
            message.error(`Missing required columns: ${missingHeaders.join(", ")}`);
            return;
          }

          setHeaders(fileHeaders);
          const validatedData = results.data.map((row, index) => validateRow(row, index));
          setParsedData(validatedData);
          setSelectedFile(file);
          setCurrentStep(1);
        } else {
          message.error("Failed to read headers from CSV.");
        }
      },
      error: (error: Error) => {
        message.error(`Failed to parse CSV: ${error.message}`);
      }
    });

    return false; // Prevent default upload behavior
  };

  const validRowsCount = parsedData.filter(r => r.isValid).length;
  const invalidRowsCount = parsedData.filter(r => !r.isValid).length;

  const handleImport = async () => {
    if (!selectedFile) {
      message.error("No file to import.");
      return;
    }

    setIsImporting(true);
    setUploadProgress(0);

    const controller = new AbortController();
    setAbortController(controller);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post("/transactions/batch", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      
      handleClose();
    } catch (error: any) {
      if (axios.isCancel(error)) {
        message.info("Upload cancelled.");
      } else {
        message.error(error?.response?.data?.message || "Failed to upload file. Please try again.");
      }
    } finally {
      setIsImporting(false);
      setAbortController(null);
    }
  };

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const previewColumns = [
    ...headers.map(header => ({
      title: header,
      dataIndex: ['raw', header],
      key: header,
    })),
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: ParsedTransaction) => (
        record.isValid ? 
        <Tag icon={<CheckCircleOutlined />} color="success">Valid</Tag> : 
        <Tag icon={<CloseCircleOutlined />} color="error">{record.errors[0]}</Tag>
      )
    }
  ];

  const steps = [
    {
      title: 'Upload CSV',
      content: (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 8, border: '1px dashed #d9d9d9', marginBottom: 24 }}>
            <Space align="start">
              <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 20, marginTop: 2 }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>Required CSV Format</Text>
                <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 12 }}>
                  Your CSV file must include the following exact column headers in the first row:
                </Paragraph>
                <Space wrap>
                  <Tag color="cyan">description</Tag>
                  <Tag color="blue">amount</Tag>
                  <Tag color="geekblue">category</Tag>
                  <Tag color="purple">occurredAt</Tag>
                </Space>
              </div>
            </Space>
          </div>
          
          <Dragger
            accept=".csv,text/csv"
            beforeUpload={handleFileUpload}
            maxCount={1}
            showUploadList={false}
            style={{ background: '#fafafa' }}
          >
            <p className="ant-upload-drag-icon">
              <FileExcelOutlined style={{ color: '#52c41a' }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16, fontWeight: 500 }}>
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
              Support for a single upload. Strictly prohibited from uploading company data or other band files.
            </p>
          </Dragger>
        </div>
      ),
    },
    {
      title: 'Preview Data',
      content: (
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" bordered={false} style={{ background: '#f5f5f5', borderRadius: 8 }}>
                <Statistic title="Total Rows" value={parsedData.length} />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" bordered={false} style={{ background: '#f6ffed', borderRadius: 8 }}>
                <Statistic 
                  title="Valid Rows" 
                  value={validRowsCount} 
                  valueStyle={{ color: '#3f8600' }} 
                  prefix={<CheckCircleOutlined />} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" bordered={false} style={{ background: invalidRowsCount > 0 ? '#fff2f0' : '#f5f5f5', borderRadius: 8 }}>
                <Statistic 
                  title="Invalid Rows" 
                  value={invalidRowsCount} 
                  valueStyle={{ color: invalidRowsCount > 0 ? '#cf1322' : '#8c8c8c' }} 
                  prefix={<CloseCircleOutlined />} 
                />
              </Card>
            </Col>
          </Row>

          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>Previewing up to 10 rows:</Text>
            <Table
              dataSource={parsedData.slice(0, 10)}
              columns={previewColumns}
              pagination={false}
              size="middle"
              bordered
              scroll={{ x: 'max-content', y: 250 }}
              rowClassName={(record) => record.isValid ? '' : 'invalid-row'}
            />
          </div>

          <style>{`
            .invalid-row { background-color: #fff2f0; }
            .invalid-row td { background-color: #fff2f0 !important; }
          `}</style>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCurrentStep(0)}>Cancel Analysis</Button>
              <Button type="primary" onClick={() => setCurrentStep(2)}>
                Continue to Confirm
              </Button>
            </Space>
          </div>
        </div>
      ),
    },
    {
      title: 'Confirm Import',
      content: (
        <div style={{ marginTop: 16 }}>
          <Result
            status={isImporting ? "info" : (invalidRowsCount === 0 ? "success" : "warning")}
            title={isImporting ? "Uploading Data..." : "Ready to Import Data"}
            subTitle={
              <div style={{ marginTop: 8 }}>
                {isImporting ? (
                  <div style={{ width: '80%', margin: '0 auto', marginTop: 16 }}>
                    {uploadProgress < 100 ? (
                      <Progress percent={uploadProgress} status="active" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 24, marginBottom: 16 }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
                      </div>
                    )}
                    <Text type="secondary" style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>
                      {uploadProgress < 100 
                        ? "Uploading file to server..." 
                        : "Upload complete. Processing and saving transactions on server, please do not close this window..."}
                    </Text>
                  </div>
                ) : (
                  <>
                    <Text>You are about to import </Text>
                    <Text strong type="success" style={{ fontSize: 16 }}>{validRowsCount}</Text>
                    <Text> valid transactions.</Text>
                    {invalidRowsCount > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="danger">Note: {invalidRowsCount} invalid rows will be skipped.</Text>
                      </div>
                    )}
                  </>
                )}
              </div>
            }
            extra={
              isImporting ? (
                <Button key="cancel" danger onClick={handleCancelUpload}>
                  Cancel Upload
                </Button>
              ) : (
                <Space>
                  <Button key="back" onClick={() => setCurrentStep(1)}>
                    Back to Preview
                  </Button>
                  <Button
                    key="import"
                    type="primary"
                    onClick={handleImport}
                    disabled={validRowsCount === 0}
                  >
                    Confirm Import
                  </Button>
                </Space>
              )
            }
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileExcelOutlined style={{ color: '#52c41a' }} />
          <span>Import Transactions (CSV)</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      styles={{
        body: { padding: '24px 0' }
      }}
    >
      <Steps 
        current={currentStep} 
        items={steps.map(item => ({ title: item.title, key: item.title }))} 
        style={{ padding: '0 24px' }}
      />
      <div style={{ padding: '0 24px' }}>{steps[currentStep].content}</div>
    </Modal>
  );
}
